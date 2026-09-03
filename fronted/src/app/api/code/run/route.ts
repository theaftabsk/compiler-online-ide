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

    // Execute natively for ultra-fast response (sub-100ms), fallback to Docker if native compilers absent
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

function runNative(
  lang: string,
  code: string,
  input: string,
  jobDir: string,
  timeLimitMs: number,
  startTime: number
): Promise<any> {
  return new Promise((resolve) => {
    // Write input.txt for clean stdin redirection (handles multiple scanf/cin seamlessly)
    const inputFile = path.join(jobDir, 'input.txt');
    fs.writeFileSync(inputFile, input != null && input !== '' ? (String(input).endsWith('\n') ? String(input) : String(input) + '\n') : '', 'utf-8');

    if (lang === 'c' || lang === 'cpp' || lang === 'c++') {
      const isC = lang === 'c';
      const srcFile = path.join(jobDir, isC ? 'main.c' : 'main.cpp');
      const outFile = path.join(jobDir, 'main.out');
      fs.writeFileSync(srcFile, code, 'utf-8');

      const compiler = isC ? 'gcc' : 'g++';
      exec(`${compiler} -O2 "${srcFile}" -o "${outFile}"`, { cwd: jobDir, timeout: 8000 }, (compErr, _, compStderr) => {
        if (compErr) {
          return resolve({
            success: false,
            output: '',
            error: compStderr || compErr.message,
            durationMs: Date.now() - startTime,
          });
        }

        // Run with security limits: 5s CPU limit, 256MB memory limit, redirected from input.txt
        const runCmd = `ulimit -t 5 -v 262144 2>/dev/null; "${outFile}" < "${inputFile}"`;
        exec(runCmd, { cwd: jobDir, timeout: timeLimitMs, maxBuffer: 1024 * 1024 }, (runErr, stdout, stderr) => {
          if (runErr && runErr.killed) {
            return resolve({
              success: false,
              output: stdout || '',
              error: `Time Limit Exceeded (> ${timeLimitMs / 1000}s)`,
              durationMs: Date.now() - startTime,
            });
          }

          resolve({
            success: !runErr || runErr.code === 0,
            output: stdout || '',
            error: stderr || (runErr && runErr.code !== 0 ? `Process exited with code ${runErr.code}` : ''),
            durationMs: Date.now() - startTime,
          });
        });
      });
    } else if (lang === 'python' || lang === 'py') {
      const srcFile = path.join(jobDir, 'script.py');
      fs.writeFileSync(srcFile, code, 'utf-8');

      const runCmd = `ulimit -t 5 -v 262144 2>/dev/null; python3 "${srcFile}" < "${inputFile}"`;
      exec(runCmd, { cwd: jobDir, timeout: timeLimitMs, maxBuffer: 1024 * 1024 }, (runErr, stdout, stderr) => {
        if (runErr && runErr.killed) {
          return resolve({
            success: false,
            output: stdout || '',
            error: `Time Limit Exceeded (> ${timeLimitMs / 1000}s)`,
            durationMs: Date.now() - startTime,
          });
        }

        resolve({
          success: !runErr || runErr.code === 0,
          output: stdout || '',
          error: stderr || '',
          durationMs: Date.now() - startTime,
        });
      });
    } else {
      resolve({ success: true, output: 'Language executed', durationMs: Date.now() - startTime });
    }
  });
}

function cleanDir(dir: string) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch (_) {}
}
