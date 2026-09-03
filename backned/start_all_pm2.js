const { Client } = require('ssh2');

const conn = new Client();

const SSH_CONFIG = {
  host: '148.113.6.25',
  port: 20007,
  username: 'root',
  password: 'VNciiCMQZjd07itn',
};

function execCommand(conn, cmd) {
  return new Promise((resolve) => {
    console.log(`\n[VPS EXEC] ${cmd}`);
    conn.exec(cmd, (err, stream) => {
      if (err) return resolve({ code: 1 });
      stream.on('close', (code) => resolve({ code }))
            .on('data', (d) => process.stdout.write(d.toString()))
            .stderr.on('data', (d) => process.stderr.write(d.toString()));
    });
  });
}

conn.on('ready', async () => {
  console.log('✓ Starting PM2 services...');
  await execCommand(conn, 'pm2 delete all || true');
  await execCommand(conn, 'cd /var/www/codelab/backned && pm2 start dist/main.js --name "codelab-backend"');
  await execCommand(conn, 'cd /var/www/codelab/fronted && pm2 start "npm start" --name "codelab-frontend"');
  await execCommand(conn, 'pm2 start "cloudflared tunnel --url http://localhost:80" --name "codelab-tunnel"');
  await execCommand(conn, 'pm2 save');
  await execCommand(conn, 'pm2 status');
  conn.end();
}).connect(SSH_CONFIG);
