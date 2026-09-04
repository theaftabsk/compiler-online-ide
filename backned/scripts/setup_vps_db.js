const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('Connected to VPS SSH. Creating database kaspro_lab...');
  const commands = [
    `sudo -u postgres psql -c "SELECT 1 FROM pg_database WHERE datname = 'kaspro_lab'" | grep -q 1 || sudo -u postgres psql -c "CREATE DATABASE kaspro_lab;"`,
    `sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'kaspro_secure_2026';"`,
    `sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE kaspro_lab TO postgres;"`,
  ].join(' && ');

  conn.exec(commands, (err, stream) => {
    if (err) {
      console.error('Error executing commands:', err);
      conn.end();
      return;
    }
    let output = '';
    stream.on('data', (d) => {
      process.stdout.write(d);
      output += d;
    });
    stream.stderr.on('data', (d) => {
      process.stderr.write(d);
    });
    stream.on('close', (code) => {
      console.log(`\nDB setup finished with code: ${code}`);
      conn.end();
    });
  });
}).connect({
  host: '148.113.6.25',
  port: 20007,
  username: 'root',
  password: 'VNciiCMQZjd07itn',
});
