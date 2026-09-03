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
  console.log('✓ Connected to VPS for Maximum Deep Cleanup...');

  try {
    console.log('\n--- BEFORE CLEANUP ---');
    await execCommand(conn, 'df -h /');

    // 1. Resize swapfile from 2GB to 512MB to instantly reclaim 1.5GB
    console.log('\n--- Optimizing Swapfile to 512MB ---');
    await execCommand(conn, 'swapoff /swapfile || true');
    await execCommand(conn, 'rm -f /swapfile');
    await execCommand(conn, 'fallocate -l 512M /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile');

    // 2. Clean APT caches & orphaned packages
    console.log('\n--- Cleaning APT ---');
    await execCommand(conn, 'apt-get autoremove --purge -y && apt-get clean && rm -rf /var/lib/apt/lists/*');

    // 3. Clean system logs completely
    console.log('\n--- Cleaning System Logs ---');
    await execCommand(conn, 'journalctl --vacuum-size=10M || true');
    await execCommand(conn, 'find /var/log -type f -regex ".*\\.[0-9].*" -delete');
    await execCommand(conn, 'find /var/log -type f -name "*.gz" -delete');

    // 4. Clean Docker builder & unused overlay layers
    console.log('\n--- Cleaning Docker & Containerd unused layers ---');
    await execCommand(conn, 'docker builder prune -a -f || true');
    await execCommand(conn, 'docker container prune -f || true');

    // 5. Clean /tmp and caches
    console.log('\n--- Cleaning /tmp and root caches ---');
    await execCommand(conn, 'rm -rf /tmp/* /var/tmp/* /root/.npm /root/.cache /root/.pm2/logs/*');
    await execCommand(conn, 'mkdir -p /tmp/codelab_runner && chmod 777 /tmp/codelab_runner');

    console.log('\n--- AFTER MAXIMUM CLEANUP ---');
    await execCommand(conn, 'df -h /');
    await execCommand(conn, 'free -m');

    // 6. Test PM2 services
    await execCommand(conn, 'pm2 status');

    console.log('\n🎉 MAXIMUM DISK CLEANUP COMPLETE!');
  } catch (err) {
    console.error('Cleanup failed:', err);
  } finally {
    conn.end();
  }
}).on('error', (err) => {
  console.error('SSH Error:', err);
}).connect(SSH_CONFIG);
