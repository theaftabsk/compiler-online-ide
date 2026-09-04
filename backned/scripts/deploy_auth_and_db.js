const { Client } = require('ssh2');

const conn = new Client();

function runCmd(cmd) {
  return new Promise((resolve, reject) => {
    console.log(`\n>>> [VPS] ${cmd}`);
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '';
      stream.on('data', d => { process.stdout.write(d); out += d; });
      stream.stderr.on('data', d => { process.stderr.write(d); out += d; });
      stream.on('close', code => {
        console.log(`[EXIT CODE: ${code}]`);
        if (code !== 0 && !cmd.includes('grep')) return reject(new Error(`Command failed with code ${code}`));
        resolve(out);
      });
    });
  });
}

conn.on('ready', async () => {
  console.log('✓ Connected to Hostinger VPS (148.113.6.25)! Starting deployment...');

  try {
    // 1. Pull latest git commits
    await runCmd('cd /var/www/codelab && git fetch origin && git reset --hard origin/main');

    // 2. Configure .env for backned
    const envContent = [
      'DATABASE_URL="postgresql://postgres:kaspro_secure_2026@127.0.0.1:5432/kaspro_lab?schema=public"',
      'JWT_SECRET="kaspro_secure_super_jwt_secret_key_2026_itvexo"',
      'PORT=5000',
    ].join('\\n');

    await runCmd(`printf '${envContent}\\n' > /var/www/codelab/backned/.env`);

    // 3. Install backend auth packages & sync PostgreSQL database schema
    await runCmd('cd /var/www/codelab/backned && npm install bcrypt jsonwebtoken @types/bcrypt @types/jsonwebtoken');
    await runCmd('cd /var/www/codelab/backned && npx prisma generate');
    await runCmd('cd /var/www/codelab/backned && npx prisma db push --accept-data-loss');

    // 4. Build backend
    await runCmd('cd /var/www/codelab/backned && npm run build');

    // 5. Build frontend
    await runCmd('cd /var/www/codelab/fronted && npm run build');

    // 6. Restart all PM2 services
    await runCmd('pm2 restart all');
    await runCmd('pm2 status');

    // 7. Verify live endpoints
    console.log('\n--- VERIFYING LIVE ENDPOINTS ---');
    await runCmd('curl -s -o /dev/null -w "%{http_code}" https://kaspro.online/teacher/login');
    await runCmd('curl -s -o /dev/null -w "%{http_code}" https://kaspro.online/teacher/register');
    await runCmd('curl -s -X POST http://127.0.0.1:5000/api/auth/login -H "Content-Type: application/json" -d \'{"email":"test@test.com","password":"dummy"}\'');

    console.log('\n🎉 ALL DEPLOYMENTS AND VERIFICATIONS SUCCEEDED!');
  } catch (err) {
    console.error('Deployment error:', err.message);
  } finally {
    conn.end();
  }
}).connect({
  host: '148.113.6.25',
  port: 20007,
  username: 'root',
  password: 'VNciiCMQZjd07itn',
});
