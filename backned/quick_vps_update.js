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
      stream.on('close', (code) => {
        console.log(`[VPS EXEC] Exit code: ${code}`);
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
  console.log('✓ Connected to VPS! Performing live update...');

  try {
    // 1. Pull latest commits from GitHub
    console.log('\n--- Pulling latest code from GitHub ---');
    await execCommand(conn, 'cd /var/www/codelab && git fetch origin && git reset --hard origin/main');

    // 2. Build Backend (NestJS)
    console.log('\n--- Compiling NestJS Backend ---');
    await execCommand(conn, 'cd /var/www/codelab/backned && npm run build');

    // 3. Build Frontend (Next.js)
    console.log('\n--- Compiling Next.js Frontend ---');
    await execCommand(conn, 'cd /var/www/codelab/fronted && npm run build');

    // 4. Restart PM2 Services
    console.log('\n--- Restarting PM2 Services ---');
    await execCommand(conn, 'pm2 restart all');
    await execCommand(conn, 'pm2 status');

    console.log('\n🎉 VPS UPDATE & DEPLOYMENT COMPLETE!');
  } catch (err) {
    console.error('Update failed:', err);
  } finally {
    conn.end();
  }
}).on('error', (err) => {
  console.error('SSH Error:', err);
}).connect(SSH_CONFIG);
