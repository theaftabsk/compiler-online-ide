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
  console.log('✓ Connected to VPS for Full System Wipe & RAM Clean...');

  try {
    // 1. Kill all running processes
    console.log('\n--- Stopping All Processes & Services ---');
    await execCommand(conn, 'pm2 kill || true');
    await execCommand(conn, 'systemctl stop nginx || true');
    await execCommand(conn, 'killall -9 node npm || true');

    // 2. Wipe web & project directories
    console.log('\n--- Wiping All Project & Temp Files ---');
    await execCommand(conn, 'rm -rf /var/www/* /root/codelab /root/.pm2 /var/log/nginx/* /tmp/* /var/tmp/*');

    // 3. Deep package & cache purge
    console.log('\n--- Purging APT and System Caches ---');
    await execCommand(conn, 'apt-get clean -y && apt-get autoremove --purge -y && apt-get autoclean -y');
    await execCommand(conn, 'journalctl --vacuum-time=1s || true');
    await execCommand(conn, 'rm -rf /root/.npm /root/.cache /var/cache/apt/archives/*');

    // 4. Drop RAM Cache (Free Memory to lowest)
    console.log('\n--- Dropping OS RAM Cache ---');
    await execCommand(conn, 'sync; echo 3 > /proc/sys/vm/drop_caches');

    // 5. Final Status
    console.log('\n--- System Status AFTER Full Wipe ---');
    await execCommand(conn, 'free -m');
    await execCommand(conn, 'df -h /');

    console.log('\n🎉 VPS IS COMPLETELY WIPED, CLEANED & READY FOR GITHUB DOCKER DEPLOYMENT!');
  } catch (err) {
    console.error('Error during wipe:', err);
  } finally {
    conn.end();
  }
}).on('error', (err) => {
  console.error('SSH Error:', err);
}).connect(SSH_CONFIG);
