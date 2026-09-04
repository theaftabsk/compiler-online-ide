const { Client } = require('ssh2');

const conn = new Client();

function runCmd(cmd) {
  return new Promise((resolve, reject) => {
    console.log(`\n>>> [VPS] ${cmd}`);
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '';
      stream.on('data', (d) => {
        process.stdout.write(d);
        out += d;
      });
      stream.stderr.on('data', (d) => {
        process.stderr.write(d);
        out += d;
      });
      stream.on('close', (code) => {
        console.log(`[EXIT CODE: ${code}]`);
        if (code !== 0) return reject(new Error(`Command failed with code ${code}`));
        resolve(out);
      });
    });
  });
}

conn.on('ready', async () => {
  console.log('✓ Connected to VPS! Pulling latest UI changes...');
  try {
    await runCmd('cd /var/www/codelab && git fetch origin && git reset --hard origin/main');
    await runCmd('cd /var/www/codelab/fronted && npm run build');
    await runCmd('pm2 restart codelab-frontend');
    console.log('\n🎉 FRONTEND REDEPLOYED SUCCESSFULLY WITH SPLIT-SCREEN UI!');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    conn.end();
  }
}).connect({
  host: '148.113.6.25',
  port: 20007,
  username: 'root',
  password: 'VNciiCMQZjd07itn',
});
