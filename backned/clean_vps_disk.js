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
  try {
    await execCommand(conn, 'df -h /');
    await execCommand(conn, 'du -sh /tmp/* /var/log/* /root/.npm 2>/dev/null | sort -hr | head -20');
    await execCommand(conn, 'rm -rf /tmp/* /var/tmp/* /root/.npm/_cacache /var/log/journal/*');
    await execCommand(conn, 'apt-get clean');
    await execCommand(conn, 'df -h /');
  } catch (err) {
    console.error(err);
  } finally {
    conn.end();
  }
}).connect(SSH_CONFIG);
