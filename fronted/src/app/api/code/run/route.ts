import { NextRequest, NextResponse } from 'next/server';
import { exec, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { language = 'c', code = '', input = '', timeLimitMs = 5000 } = body;

    const executionId = crypto.randomBytes(8).toString('hex');
    const tempDir = path.join(os.tmpdir(), 'codelab_runner', executionId);
    fs.mkdirSync(tempDir, { recursive: true });

    const startTime = Date.now();
    const lang = language.toLowerCase();

    // Check if Docker is available
    const hasDocker = await checkDocker();

    if (hasDocker) {
      // Execute in Docker
      const res = await runInDocker(lang, code, input, tempDir, timeLimitMs);
      cleanDir(tempDir);
      return NextResponse.json(res);
    }

    // Native fallback if GCC / Python is installed on host
    const res = await runNative(lang, code, input, tempDir, timeLimitMs, startTime);
    cleanDir(tempDir);
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      output: '',
      error: `Execution Error: ${err.message}`,
      durationMs: 10,
    });
  }
}

function checkDocker(): Promise<boolean> {
  return new Promise((resolve) => {
    exec('docker --version', (err) => resolve(!err));
  });
}

function runInDocker(
  lang: string,
  code: string,
  input: string,
  jobDir: string,
  timeLimitMs: number
): Promise<any> {
  return new Promise(async (resolve) => {
    const startTime = Date.now();
    let srcFile = 'main.c';
    let image = 'gcc:latest';
    let compileCmd = 'gcc main.c -O2 -o main.out';
    let runCmd = './main.out';

    if (lang === 'cpp' || lang === 'c++') {
      srcFile = 'main.cpp';
      image = 'gcc:latest';
      compileCmd = 'g++ main.cpp -O2 -o main.out';
      runCmd = './main.out';
    } else if (lang === 'python' || lang === 'py') {
      srcFile = 'script.py';
      image = 'python:3.11-alpine';
      compileCmd = '';
      runCmd = 'python3 script.py';
    }

    fs.writeFileSync(path.join(jobDir, srcFile), code, 'utf-8');

    const dockerBase = [
      'run', '--rm',
      '--network', 'none',
      '--cpus', '0.5',
      '-m', '128m',
      '-v', `${jobDir}:/workspace:rw`,
      '-w', '/workspace',
      image
    ];

    if (compileCmd) {
      const compileProc = spawn('docker', [...dockerBase, 'sh', '-c', compileCmd]);
      let compErr = '';
      compileProc.stderr.on('data', (d) => { compErr += d.toString(); });
      
      compileProc.on('close', (code) => {
        if (code !== 0) {
          return resolve({
            success: false,
            output: '',
            error: compErr || 'Compilation Error',
            durationMs: Date.now() - startTime,
          });
        }
        executeBinary(dockerBase, runCmd, input, timeLimitMs, startTime, resolve);
      });
    } else {
      executeBinary(dockerBase, runCmd, input, timeLimitMs, startTime, resolve);
    }
  });
}

function executeBinary(
  dockerBase: string[],
  runCmd: string,
  input: string,
  timeLimitMs: number,
  startTime: number,
  resolve: (val: any) => void
) {
  // Pass -i for interactive execution so stdin pipe is connected, and execute binary directly
  const runArgs = runCmd.split(' ');
  const child = spawn('docker', ['run', '--rm', '-i', ...dockerBase.slice(2), ...runArgs]);
  let stdout = '';
  let stderr = '';

  child.stdout?.on('data', (d) => { stdout += d.toString(); });
  child.stderr?.on('data', (d) => { stderr += d.toString(); });

  if (child.stdin) {
    if (input != null && input !== '') {
      child.stdin.write(String(input).endsWith('\n') ? String(input) : String(input) + '\n');
    }
    try { child.stdin.end(); } catch (_) {}
  }

  const timer = setTimeout(() => {
    try { child.kill('SIGKILL'); } catch (_) {}
    resolve({
      success: false,
      output: stdout,
      error: 'Time Limit Exceeded (> 3.0s)',
      durationMs: Date.now() - startTime,
    });
  }, timeLimitMs);

  child.on('close', (code) => {
    clearTimeout(timer);
    resolve({
      success: code === 0,
      output: stdout,
      error: stderr,
      durationMs: Date.now() - startTime,
    });
  });
}

function runNative(
  lang: string,
  code: string,
  input: string,
  jobDir: string,
  timeLimitMs: number,
  startTime: number
): Promise<any> {
  return new Promise((resolve) => {
    if (lang === 'c' || lang === 'cpp') {
      const srcFile = path.join(jobDir, lang === 'c' ? 'main.c' : 'main.cpp');
      const outFile = path.join(jobDir, 'main.out');
      fs.writeFileSync(srcFile, code, 'utf-8');

      const compiler = lang === 'c' ? 'gcc' : 'g++';
      exec(`${compiler} "${srcFile}" -o "${outFile}"`, (compErr, _, compStderr) => {
        if (compErr) {
          return resolve({
            success: false,
            output: '',
            error: compStderr || compErr.message,
            durationMs: Date.now() - startTime,
          });
        }

        const child = spawn(outFile, [], { cwd: jobDir });
        let out = '';
        let err = '';
        child.stdout.on('data', (d) => { out += d.toString(); });
        child.stderr.on('data', (d) => { err += d.toString(); });

        if (child.stdin) {
          if (input != null && input !== '') {
            child.stdin.write(String(input).endsWith('\n') ? String(input) : String(input) + '\n');
          }
          try { child.stdin.end(); } catch (_) {}
        }

        const timer = setTimeout(() => {
          try { child.kill(); } catch (_) {}
          resolve({ success: false, output: out, error: 'Time Limit Exceeded', durationMs: Date.now() - startTime });
        }, timeLimitMs);

        child.on('close', (code) => {
          clearTimeout(timer);
          resolve({ success: code === 0, output: out, error: err, durationMs: Date.now() - startTime });
        });
      });
    } else if (lang === 'python' || lang === 'py') {
      const srcFile = path.join(jobDir, 'script.py');
      fs.writeFileSync(srcFile, code, 'utf-8');
      const child = spawn('python3', [srcFile], { cwd: jobDir });
      let out = '';
      let err = '';
      child.stdout.on('data', (d) => { out += d.toString(); });
      child.stderr.on('data', (d) => { err += d.toString(); });

      if (child.stdin) {
        if (input != null && input !== '') {
          child.stdin.write(String(input).endsWith('\n') ? String(input) : String(input) + '\n');
        }
        try { child.stdin.end(); } catch (_) {}
      }

      child.on('close', (code) => {
        resolve({ success: code === 0, output: out, error: err, durationMs: Date.now() - startTime });
      });
    } else {
      resolve({ success: true, output: 'Executed', durationMs: Date.now() - startTime });
    }
  });
}

function cleanDir(dir: string) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch (_) {}
}
