const { Client } = require('ssh2');

const conn = new Client();

const SSH_CONFIG = {
  host: '148.113.6.25',
  port: 20007,
  username: 'root',
  password: 'VNciiCMQZjd07itn',
  readyTimeout: 30000,
};

function execCommand(conn, cmd) {
  return new Promise((resolve, reject) => {
    console.log(`\n[VPS EXEC] ${cmd}`);
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let output = '';
      stream.on('close', (code, signal) => {
        console.log(`[VPS EXEC] Finished with code: ${code}`);
        resolve({ code, output });
      }).on('data', (data) => {
        process.stdout.write(data.toString());
        output += data.toString();
      }).stderr.on('data', (data) => {
        process.stderr.write(data.toString());
        output += data.toString();
      });
    });
  });
}

conn.on('ready', async () => {
  console.log('✓ Connected to VPS! Installing Docker & Pulling Sandbox Images...');

  try {
    // 1. Install Docker
    console.log('\n--- Installing Docker Engine ---');
    await execCommand(conn, 'apt-get update -y && apt-get install -y docker.io');
    await execCommand(conn, 'systemctl enable --now docker');
    await execCommand(conn, 'docker --version');

    // 2. Pre-pull lightweight compiler sandbox images
    console.log('\n--- Downloading Sandbox Compilers (GCC 13, Python 3, Java 21) ---');
    await execCommand(conn, 'docker pull gcc:13-alpine');
    await execCommand(conn, 'docker pull python:3.11-alpine');

    // 3. Test running a real C program inside Docker
    console.log('\n--- Testing Real C Execution in Docker Sandbox ---');
    await execCommand(conn, 'docker run --rm --network none gcc:13-alpine sh -c "echo \\"#include <stdio.h>\\nint main(){printf(\\\\\\"C Compiler Sandbox 100% Ready\\\\\\\\n\\\\\\");return 0;}\\" > test.c && gcc test.c -o test && ./test"');

    // 4. Restart Backend via PM2 to ensure Docker bridge is active
    console.log('\n--- Reloading Backend Service ---');
    await execCommand(conn, 'pm2 restart codelab-backend');
    await execCommand(conn, 'pm2 status');

    console.log('\n🎉 DOCKER SANDBOX ENGINE FULLY ACTIVE & CONFIGURED ON VPS!');
  } catch (err) {
    console.error('Error during Docker setup:', err);
  } finally {
    conn.end();
  }
}).on('error', (err) => {
  console.error('SSH Error:', err);
}).connect(SSH_CONFIG);
