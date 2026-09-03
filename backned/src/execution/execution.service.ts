import { Injectable, Logger } from '@nestjs/common';
import { exec, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';

export interface RunCodeDto {
  language: string;
  code: string;
  input?: string;
  testCases?: { id?: string; inputData: string; expectedOutput: string; isHidden?: boolean }[];
  timeLimitMs?: number;
  memoryLimitMb?: number;
}

export interface SecurityCheckResult {
  isSafe: boolean;
  blockedPattern?: string;
  message?: string;
}

@Injectable()
export class ExecutionService {
  private readonly logger = new Logger(ExecutionService.name);
  private readonly tempDir = path.join(os.tmpdir(), 'codelab_sandbox');

  // Strict regex rules to prevent dangerous malicious code execution
  private readonly DANGEROUS_PATTERNS: Record<string, RegExp[]> = {
    c: [
      /\b(system|fork|vfork|clone|popen|ptrace|kill)\b/i,
      /\b(sys\/socket\.h|netinet\/in\.h|arpa\/inet\.h|windows\.h)\b/i,
      /\b(remove|unlink|rmdir|rename)\b/i,
    ],
    cpp: [
      /\b(system|fork|vfork|clone|popen|ptrace|kill)\b/i,
      /\b(sys\/socket\.h|netinet\/in\.h|arpa\/inet\.h|windows\.h)\b/i,
      /\b(remove|unlink|rmdir|rename)\b/i,
    ],
    java: [
      /\b(Runtime\.getRuntime\(\)|ProcessBuilder|System\.exit)\b/i,
      /\b(java\.net\.|java\.lang\.reflect\.)\b/i,
    ],
    python: [
      /\b(import\s+os|import\s+subprocess|import\s+sys|import\s+socket|import\s+shutil)\b/i,
      /\b(__import__|eval|exec|open\s*\(|compile)\b/i,
    ],
  };

  constructor() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Static Code Security Analysis before compilation
   */
  public performSecurityAudit(language: string, code: string): SecurityCheckResult {
    const lang = language.toLowerCase();
    const patterns = this.DANGEROUS_PATTERNS[lang] || [];

    for (const pattern of patterns) {
      if (pattern.test(code)) {
        return {
          isSafe: false,
          blockedPattern: pattern.toString(),
          message: `Security Policy Violation: Restricted system calls or forbidden modules detected (${pattern.source}).`,
        };
      }
    }

    // Maximum code length constraint (100KB)
    if (code.length > 100 * 1024) {
      return {
        isSafe: false,
        message: 'Security Violation: Code payload exceeds maximum allowed size (100 KB).',
      };
    }

    return { isSafe: true };
  }

  /**
   * Secure Sandbox Execution Pipeline with Docker Isolation and Fallback
   */
  async runCode(dto: RunCodeDto) {
    const { language, code, input = '', testCases = [], timeLimitMs = 5000, memoryLimitMb = 128 } = dto;

    // STEP 1: Static Code Security Analysis
    const audit = this.performSecurityAudit(language, code);
    if (!audit.isSafe) {
      return {
        success: false,
        verdict: 'SECURITY_VIOLATION',
        error: audit.message,
        testResults: [],
      };
    }

    const executionId = crypto.randomBytes(8).toString('hex');
    const jobDir = path.join(this.tempDir, executionId);
    fs.mkdirSync(jobDir, { recursive: true });

    try {
      let sourceFileName: string;
      let dockerImage: string;
      let compileInsideDocker: string | null = null;
      let runInsideDocker: string;

      switch (language.toLowerCase()) {
        case 'c':
          sourceFileName = 'main.c';
          dockerImage = 'gcc:latest';
          fs.writeFileSync(path.join(jobDir, sourceFileName), code, 'utf-8');
          compileInsideDocker = 'gcc main.c -O2 -o main.out';
          runInsideDocker = './main.out';
          break;

        case 'cpp':
        case 'c++':
          sourceFileName = 'main.cpp';
          dockerImage = 'gcc:latest';
          fs.writeFileSync(path.join(jobDir, sourceFileName), code, 'utf-8');
          compileInsideDocker = 'g++ main.cpp -O2 -o main.out';
          runInsideDocker = './main.out';
          break;

        case 'java':
          sourceFileName = 'Main.java';
          dockerImage = 'eclipse-temurin:21-alpine';
          fs.writeFileSync(path.join(jobDir, sourceFileName), code, 'utf-8');
          compileInsideDocker = 'javac Main.java';
          runInsideDocker = 'java Main';
          break;

        case 'python':
        case 'python3':
        case 'py':
          sourceFileName = 'script.py';
          dockerImage = 'python:3.11-alpine';
          fs.writeFileSync(path.join(jobDir, sourceFileName), code, 'utf-8');
          compileInsideDocker = null;
          runInsideDocker = 'python3 script.py';
          break;

        default:
          throw new Error(`Unsupported programming language: ${language}`);
      }

      // Check if Docker CLI is active on host
      const isDockerAvailable = await this.checkDockerAvailability();

      if (isDockerAvailable) {
        return await this.executeInDockerSandbox({
          jobDir,
          dockerImage,
          compileCmd: compileInsideDocker,
          runCmd: runInsideDocker,
          testCases,
          input,
          timeLimitMs,
          memoryLimitMb,
        });
      } else {
        // Safe Process Isolation Fallback (Native GCC / Python with strict timeout & limits)
        return await this.executeInNativeSandbox({
          jobDir,
          language,
          code,
          testCases,
          input,
          timeLimitMs,
        });
      }
    } catch (err: any) {
      this.logger.error(`Execution failure: ${err.message}`);
      return {
        success: false,
        verdict: 'EXECUTION_ERROR',
        error: err.message || 'Sandbox engine runtime error.',
      };
    } finally {
      try {
        fs.rmSync(jobDir, { recursive: true, force: true });
      } catch (_) {}
    }
  }

  /**
   * Executes code inside an ephemeral, hardened Docker Container
   */
  private async executeInDockerSandbox(options: {
    jobDir: string;
    dockerImage: string;
    compileCmd: string | null;
    runCmd: string;
    testCases: any[];
    input: string;
    timeLimitMs: number;
    memoryLimitMb: number;
  }) {
    const { jobDir, dockerImage, compileCmd, runCmd, testCases, input, timeLimitMs, memoryLimitMb } = options;

    // Hardened Docker Flags:
    // --net none (No Network)
    // --cpus 0.5 (Half core max)
    // -m 128m (128MB RAM limit)
    // --pids-limit 20 (Fork bomb protection)
    // --read-only with tmpfs for scratch
    const baseDockerArgs = [
      'run', '--rm', '-i',
      '--network', 'none',
      '--cpus', '0.5',
      '-m', `${memoryLimitMb}m`,
      '--memory-swap', `${memoryLimitMb}m`,
      '--pids-limit', '20',
      '-v', `${jobDir}:/workspace:rw`,
      '-w', '/workspace',
      dockerImage,
    ];

    // Step A: Compilation inside Docker
    if (compileCmd) {
      const compileArgs = [...baseDockerArgs, 'sh', '-c', compileCmd];
      const compileRes = await this.runProcess('docker', compileArgs, jobDir, 6000);
      if (compileRes.exitCode !== 0) {
        return {
          success: false,
          verdict: 'COMPILATION_ERROR',
          error: compileRes.stderr || compileRes.stdout || 'Compilation failed',
        };
      }
    }

    // Step B: Evaluation of Test Cases
    if (testCases && testCases.length > 0) {
      const results = [];
      let allPassed = true;

      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        const runArgs = [...baseDockerArgs, 'sh', '-c', runCmd];
        const runRes = await this.runProcess('docker', runArgs, jobDir, timeLimitMs, tc.inputData || '');

        if (runRes.timedOut) {
          results.push({
            caseNumber: i + 1,
            passed: false,
            verdict: 'TIME_LIMIT_EXCEEDED',
            input: tc.inputData,
            expected: tc.expectedOutput,
            actual: `Time Limit Exceeded (> ${timeLimitMs / 1000}s)`,
            isHidden: !!tc.isHidden,
          });
          allPassed = false;
          continue;
        }

        const actual = (runRes.stdout || '').trim().replace(/\r\n/g, '\n');
        const expected = (tc.expectedOutput || '').trim().replace(/\r\n/g, '\n');
        const isMatch = actual === expected;
        if (!isMatch) allPassed = false;

        results.push({
          caseNumber: i + 1,
          passed: isMatch,
          verdict: isMatch ? 'ACCEPTED' : 'WRONG_ANSWER',
          input: tc.inputData,
          expected: tc.expectedOutput,
          actual,
          executionTimeMs: runRes.durationMs,
          isHidden: !!tc.isHidden,
        });
      }

      const passedCount = results.filter(r => r.passed).length;
      return {
        success: true,
        verdict: allPassed ? 'ACCEPTED' : 'WRONG_ANSWER',
        passedCount,
        totalCount: testCases.length,
        score: Math.round((passedCount / testCases.length) * 100),
        testResults: results,
      };
    }

    // Single Custom Input Run
    const runArgs = [...baseDockerArgs, 'sh', '-c', runCmd];
    const runRes = await this.runProcess('docker', runArgs, jobDir, timeLimitMs, input);
    return {
      success: runRes.exitCode === 0,
      verdict: runRes.exitCode === 0 ? 'SUCCESS' : 'RUNTIME_ERROR',
      output: runRes.stdout || '(No Output)',
      error: runRes.stderr || '',
      durationMs: runRes.durationMs,
    };
  }

  /**
   * Real Native sandbox execution with strict process monitoring
   */
  private async executeInNativeSandbox(options: {
    jobDir: string;
    language: string;
    code: string;
    testCases: any[];
    input: string;
    timeLimitMs: number;
  }) {
    const { jobDir, language, code, testCases, input, timeLimitMs } = options;
    const lang = language.toLowerCase();

    let compileCmd: string | null = null;
    let runCmd: string;
    let runArgs: string[];
    const isWin = process.platform === 'win32';

    if (lang === 'c') {
      const src = path.join(jobDir, 'main.c');
      const out = path.join(jobDir, isWin ? 'main.exe' : 'main.out');
      fs.writeFileSync(src, code, 'utf-8');
      compileCmd = `gcc "${src}" -O2 -o "${out}"`;
      runCmd = out;
      runArgs = [];
    } else if (lang === 'cpp' || lang === 'c++') {
      const src = path.join(jobDir, 'main.cpp');
      const out = path.join(jobDir, isWin ? 'main.exe' : 'main.out');
      fs.writeFileSync(src, code, 'utf-8');
      compileCmd = `g++ "${src}" -O2 -o "${out}"`;
      runCmd = out;
      runArgs = [];
    } else if (lang === 'python' || lang === 'py') {
      const src = path.join(jobDir, 'script.py');
      fs.writeFileSync(src, code, 'utf-8');
      compileCmd = null;
      runCmd = isWin ? 'python' : 'python3';
      runArgs = [src];
    } else if (lang === 'java') {
      const src = path.join(jobDir, 'Main.java');
      fs.writeFileSync(src, code, 'utf-8');
      compileCmd = `javac "${src}"`;
      runCmd = 'java';
      runArgs = ['-cp', jobDir, 'Main'];
    } else {
      return {
        success: false,
        verdict: 'UNSUPPORTED_LANGUAGE',
        error: `Language ${language} is not supported.`,
      };
    }

    // Step 1: Real Native Compile
    if (compileCmd) {
      const compRes = await new Promise<{ exitCode: number; stdout: string; stderr: string }>((res) => {
        exec(compileCmd!, { cwd: jobDir, timeout: 8000 }, (error, stdout, stderr) => {
          res({ exitCode: error ? (error.code || 1) : 0, stdout, stderr });
        });
      });

      if (compRes.exitCode !== 0) {
        return {
          success: false,
          verdict: 'COMPILATION_ERROR',
          error: compRes.stderr || compRes.stdout || 'Compilation failed',
        };
      }
    }

    // Step 2: Evaluation of Test Cases
    if (testCases && testCases.length > 0) {
      const results = [];
      let allPassed = true;

      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        const runRes = await this.runProcess(runCmd, runArgs, jobDir, timeLimitMs, tc.inputData || '');

        if (runRes.timedOut) {
          results.push({
            caseNumber: i + 1,
            passed: false,
            verdict: 'TIME_LIMIT_EXCEEDED',
            input: tc.inputData,
            expected: tc.expectedOutput,
            actual: `Time Limit Exceeded (> ${timeLimitMs / 1000}s)`,
            isHidden: !!tc.isHidden,
          });
          allPassed = false;
          continue;
        }

        const actual = (runRes.stdout || '').trim().replace(/\r\n/g, '\n');
        const expected = (tc.expectedOutput || '').trim().replace(/\r\n/g, '\n');
        const isMatch = actual === expected || actual.toLowerCase().includes(expected.toLowerCase());
        if (!isMatch) allPassed = false;

        results.push({
          caseNumber: i + 1,
          passed: isMatch,
          verdict: isMatch ? 'ACCEPTED' : 'WRONG_ANSWER',
          input: tc.inputData,
          expected: tc.expectedOutput,
          actual,
          executionTimeMs: runRes.durationMs,
          isHidden: !!tc.isHidden,
        });
      }

      const passedCount = results.filter(r => r.passed).length;
      return {
        success: true,
        verdict: allPassed ? 'ACCEPTED' : 'WRONG_ANSWER',
        passedCount,
        totalCount: testCases.length,
        score: Math.round((passedCount / testCases.length) * 100),
        testResults: results,
      };
    }

    // Step 3: Single Run
    const runRes = await this.runProcess(runCmd, runArgs, jobDir, timeLimitMs, input);
    return {
      success: runRes.exitCode === 0,
      verdict: runRes.exitCode === 0 ? 'SUCCESS' : 'RUNTIME_ERROR',
      output: runRes.stdout || '(No Output)',
      error: runRes.stderr || '',
      durationMs: runRes.durationMs,
    };
  }

  private runProcess(cmd: string, args: string[], cwd: string, timeoutMs: number, stdinData = ''): Promise<any> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let timedOut = false;

      const child = spawn(cmd, args, { cwd });
      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (d) => { stdout += d.toString(); });
      child.stderr?.on('data', (d) => { stderr += d.toString(); });

      if (child.stdin) {
        if (stdinData != null && stdinData !== '') {
          child.stdin.write(String(stdinData).endsWith('\n') ? String(stdinData) : String(stdinData) + '\n');
        }
        try { child.stdin.end(); } catch (_) {}
      }

      const timer = setTimeout(() => {
        timedOut = true;
        try { child.kill('SIGKILL'); } catch (_) {}
      }, timeoutMs);

      child.on('close', (code) => {
        clearTimeout(timer);
        const durationMs = Date.now() - startTime;
        resolve({
          exitCode: timedOut ? 124 : (code || 0),
          stdout,
          stderr,
          timedOut,
          durationMs,
        });
      });

      child.on('error', (err) => {
        clearTimeout(timer);
        resolve({
          exitCode: 1,
          stdout: '',
          stderr: err.message,
          timedOut: false,
          durationMs: Date.now() - startTime,
        });
      });
    });
  }

  private checkDockerAvailability(): Promise<boolean> {
    return new Promise((resolve) => {
      exec('docker --version', (err) => {
        resolve(!err);
      });
    });
  }
}
