const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();

const SSH_CONFIG = {
  host: '148.113.6.25',
  port: 20007,
  username: 'root',
  password: 'VNciiCMQZjd07itn',
  readyTimeout: 30000,
};

console.log('Connecting to VPS:', SSH_CONFIG.host + ':' + SSH_CONFIG.port);

function execCommand(conn, cmd) {
  return new Promise((resolve, reject) => {
    console.log(`\n[VPS EXEC] Running: ${cmd}`);
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
  console.log('✓ SSH Connection Established Successfully!');

  try {
    // 1. Clean existing files on VPS
    await execCommand(conn, 'pm2 kill || true');
    await execCommand(conn, 'rm -rf /var/www/codelab /root/codelab');
    await execCommand(conn, 'mkdir -p /var/www/codelab');

    // 2. System update & Install Node.js 20, PM2, Nginx, GCC, G++, Python3
    await execCommand(conn, 'apt-get update -y && apt-get install -y curl git nginx build-essential gcc g++ python3');
    await execCommand(conn, 'curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs');
    await execCommand(conn, 'npm install -g pm2');

    console.log('✓ Environment tools and packages installed on VPS!');
  } catch (err) {
    console.error('Error during setup:', err);
  } finally {
    conn.end();
  }
}).on('error', (err) => {
  console.error('SSH Error:', err);
}).connect(SSH_CONFIG);
