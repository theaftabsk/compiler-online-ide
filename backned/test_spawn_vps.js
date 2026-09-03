const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  const cmd = `
cat << 'EOF' > /tmp/test_runner.js
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');

const jobDir = '/tmp/codelab_sandbox/test1234';
fs.mkdirSync(jobDir, { recursive: true });
fs.writeFileSync(jobDir + '/main.c', '#include <stdio.h>\\nint main(){ int n; scanf("%d", &n); printf("OUT=%d\\\\n", n*5); return 0; }');
fs.writeFileSync(jobDir + '/input.txt', '10\\n');

const compileRes = spawnSync('docker', [
  'run', '--rm', '--network', 'none', '--cpus', '0.5', '-m', '128m',
  '-v', \`\${jobDir}:/workspace:rw\`, '-w', '/workspace',
  'gcc:latest', 'sh', '-c', 'gcc main.c -O2 -o main.out'
]);
console.log('Compile exit code:', compileRes.status);
console.log('Compile stdout:', compileRes.stdout.toString());
console.log('Compile stderr:', compileRes.stderr.toString());

const runRes = spawnSync('docker', [
  'run', '--rm', '--network', 'none', '--cpus', '0.5', '-m', '128m',
  '-v', \`\${jobDir}:/workspace:rw\`, '-w', '/workspace',
  'gcc:latest', 'sh', '-c', './main.out < input.txt'
]);
console.log('Run exit code:', runRes.status);
console.log('Run stdout:', runRes.stdout.toString());
console.log('Run stderr:', runRes.stderr.toString());
EOF
node /tmp/test_runner.js
`;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', () => conn.end());
  });
}).connect({ host: '148.113.6.25', port: 20007, username: 'root', password: 'VNciiCMQZjd07itn' });
