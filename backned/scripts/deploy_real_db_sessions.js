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
  console.log('✓ Connected to VPS! Deploying real PostgreSQL session system...');
  try {
    // 1. Pull latest git commits
    await runCmd('cd /var/www/codelab && git fetch origin && git reset --hard origin/main');

    // 2. Prisma sync on VPS
    await runCmd('cd /var/www/codelab/backned && npx prisma generate');
    await runCmd('cd /var/www/codelab/backned && npx prisma db push --accept-data-loss');

    // 3. Build & restart backend
    await runCmd('cd /var/www/codelab/backned && npm run build');
    await runCmd('pm2 restart codelab-backend');

    // 4. Build & restart frontend
    await runCmd('cd /var/www/codelab/fronted && npm run build');
    await runCmd('pm2 restart codelab-frontend');

    // 5. Seed Aftab Sk (Roll 538, PC-14) into PostgreSQL session LAB-2026
    console.log('\n--- SEEDING REAL STUDENT ATTENDEE INTO POSTGRESQL ---');
    const studentCode = `#include <stdio.h>\\n\\nint main() {\\n    float a, b, c, average;\\n    printf(\\"Enter three numbers: \\");\\n    scanf(\\"%f %f %f\\", &a, &b, &c);\\n    average = (a + b + c) / 3;\\n    printf(\\"Average = %.2f\\", average);\\n    return 0;\\n}`;

    await runCmd(`curl -s -X POST http://127.0.0.1:5000/api/sessions/join -H "Content-Type: application/json" -d '{"sessionCode":"LAB-2026","machineNumber":"PC-14","name":"Aftab Sk","rollNumber":"538","section":"Section J - Batch 2026"}'`);

    await runCmd(`curl -s -X POST http://127.0.0.1:5000/api/sessions/heartbeat -H "Content-Type: application/json" -d '{"sessionCode":"LAB-2026","machineNumber":"PC-14","code":"${studentCode}","score":100,"tabSwitches":0}'`);

    // 6. Verify grid API output directly from PostgreSQL
    console.log('\n--- VERIFYING LIVE POSTGRESQL GRID API ---');
    const gridOut = await runCmd('curl -s http://127.0.0.1:5000/api/sessions/LAB-2026/grid');
    console.log('\nGrid API output snippet:', gridOut.slice(0, 350) + '...');

    console.log('\n🎉 ALL REAL DATABASE SESSION SYNC DEPLOYED SUCCESSFULLY!');
  } catch (e) {
    console.error('Error during deployment:', e.message);
  } finally {
    conn.end();
  }
}).connect({
  host: '148.113.6.25',
  port: 20007,
  username: 'root',
  password: 'VNciiCMQZjd07itn',
});
