const { Client } = require('ssh2');

const conn = new Client();

const SSH_CONFIG = {
  host: '148.113.6.25',
  port: 20007,
  username: 'root',
  password: 'VNciiCMQZjd07itn',
};

conn.on('ready', () => {
  const cmd = `echo '{"log-driver":"json-file","log-opts":{"max-size":"5m","max-file":"2"}}' > /etc/docker/daemon.json && systemctl restart docker && echo "DOCKER_DAEMON_OK"`;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d));
    stream.on('close', () => conn.end());
  });
}).connect(SSH_CONFIG);
