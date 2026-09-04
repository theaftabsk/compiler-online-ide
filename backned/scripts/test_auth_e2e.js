const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('Connected to VPS. Running end-to-end auth test...');

  const registerPayload = JSON.stringify({
    fullName: 'Prof. Aftab Sk',
    email: 'aftab.faculty@itvexo.com',
    password: 'Password@2026',
    institutionName: 'Brainware University',
    departmentName: 'Computer Science and Engineering',
    designation: 'Assistant Professor',
  });

  const cmd = `curl -s -X POST http://127.0.0.1:5000/api/auth/register -H 'Content-Type: application/json' -d '${registerPayload}'`;

  conn.exec(cmd, (err, stream) => {
    let out = '';
    stream.on('data', (d) => (out += d));
    stream.on('close', () => {
      console.log('\n--- 1. REGISTER RESPONSE ---');
      console.log(out);

      let token = '';
      try {
        const parsed = JSON.parse(out);
        token = parsed.token;
      } catch (_) {}

      // Test login
      const loginPayload = JSON.stringify({
        email: 'aftab.faculty@itvexo.com',
        password: 'Password@2026',
      });
      const loginCmd = `curl -s -X POST http://127.0.0.1:5000/api/auth/login -H 'Content-Type: application/json' -d '${loginPayload}'`;

      conn.exec(loginCmd, (err2, stream2) => {
        let out2 = '';
        stream2.on('data', (d) => (out2 += d));
        stream2.on('close', () => {
          console.log('\n--- 2. LOGIN RESPONSE ---');
          console.log(out2);

          if (!token) {
            try {
              token = JSON.parse(out2).token;
            } catch (_) {}
          }

          // Test me endpoint with JWT Bearer
          const meCmd = `curl -s http://127.0.0.1:5000/api/auth/me -H 'Authorization: Bearer ${token}'`;
          conn.exec(meCmd, (err3, stream3) => {
            let out3 = '';
            stream3.on('data', (d) => (out3 += d));
            stream3.on('close', () => {
              console.log('\n--- 3. /api/auth/me (JWT PROTECTED) RESPONSE ---');
              console.log(out3);

              // Query PostgreSQL directly
              const dbCmd = `sudo -u postgres psql -d kaspro_lab -c 'SELECT id, "fullName", email, role, "institutionName" FROM "User";'`;
              conn.exec(dbCmd, (err4, stream4) => {
                let out4 = '';
                stream4.on('data', (d) => (out4 += d));
                stream4.on('close', () => {
              // Test duplicate prevention
              const dupCmd = `curl -s -X POST http://127.0.0.1:5000/api/auth/register -H 'Content-Type: application/json' -d '${registerPayload}'`;
              conn.exec(dupCmd, (err5, stream5) => {
                let out5 = '';
                stream5.on('data', d => out5 += d);
                stream5.on('close', () => {
                  console.log('\n--- 5. DUPLICATE REGISTRATION REJECTION ---');
                  console.log(out5);
                  conn.end();
                });
              });
                });
              });
            });
          });
        });
      });
    });
  });
}).connect({
  host: '148.113.6.25',
  port: 20007,
  username: 'root',
  password: 'VNciiCMQZjd07itn',
});
