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
  console.log('✓ Connected to VPS for Deep Disk Cleaning...');

  try {
    console.log('\n--- Disk usage BEFORE cleanup ---');
    await execCommand(conn, 'df -h /');

    // 1. Clean APT cache and old packages
    console.log('\n--- Cleaning APT Cache & Unused Packages ---');
    await execCommand(conn, 'apt-get clean -y && apt-get autoremove --purge -y && apt-get autoclean -y');

    // 2. Clean Systemd System Logs
    console.log('\n--- Cleaning System Journal Logs ---');
    await execCommand(conn, 'journalctl --vacuum-time=1d || true');
    await execCommand(conn, 'rm -rf /var/log/*.gz /var/log/*.[0-9] /var/log/*-???????? || true');

    // 3. Clean Docker system if any
    console.log('\n--- Cleaning Docker cache ---');
    await execCommand(conn, 'docker system prune -a --volumes -f || true');

    // 4. Clean temporary caches
    console.log('\n--- Cleaning Temp files & NPM Cache ---');
    await execCommand(conn, 'rm -rf /tmp/* /var/tmp/* /root/.npm/_cacache /root/.cache || true');

    console.log('\n--- Disk usage AFTER Deep Cleanup ---');
    await execCommand(conn, 'df -h /');

    console.log('\n🎉 DISK CLEANUP COMPLETED!');
  } catch (err) {
    console.error('Error during cleanup:', err);
  } finally {
    conn.end();
  }
}).on('error', (err) => {
  console.error('SSH Error:', err);
}).connect(SSH_CONFIG);
