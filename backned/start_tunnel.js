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
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let output = '';
      stream.on('close', (code) => resolve({ code, output }))
            .on('data', (d) => { output += d.toString(); process.stdout.write(d.toString()); })
            .stderr.on('data', (d) => { output += d.toString(); process.stderr.write(d.toString()); });
    });
  });
}

conn.on('ready', async () => {
  console.log('✓ Connected to VPS!');
  await execCommand(conn, 'pm2 delete codelab-tunnel || true');
  await execCommand(conn, 'pm2 start "cloudflared tunnel --url http://localhost:80" --name "codelab-tunnel"');
  await execCommand(conn, 'sleep 5');
  console.log('\n--- Reading Tunnel Logs for Live Public URL ---');
  await execCommand(conn, 'cat /root/.pm2/logs/codelab-tunnel-out.log /root/.pm2/logs/codelab-tunnel-error.log 2>/dev/null | grep -o "https://.*\\.trycloudflare\\.com" | tail -n 1');
  await execCommand(conn, 'pm2 save');
  conn.end();
}).connect(SSH_CONFIG);
