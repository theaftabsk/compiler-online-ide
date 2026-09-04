const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('Seeding demo faculty user faculty@university.edu into PostgreSQL...');

  const payload = JSON.stringify({
    fullName: 'Prof. Aftab Sk (Demo Faculty)',
    email: 'faculty@university.edu',
    password: 'admin123',
    institutionName: 'Brainware University',
    departmentName: 'Computer Science and Engineering',
    designation: 'Head of Lab',
  });

  const cmd = `curl -s -X POST http://127.0.0.1:5000/api/auth/register -H 'Content-Type: application/json' -d '${payload}'`;

  conn.exec(cmd, (err, stream) => {
    let out = '';
    stream.on('data', (d) => (out += d));
    stream.on('close', () => {
      console.log('Seed Result:', out);
      conn.end();
    });
  });
}).connect({
  host: '148.113.6.25',
  port: 20007,
  username: 'root',
  password: 'VNciiCMQZjd07itn',
});
