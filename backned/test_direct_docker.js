const { Client } = require('ssh2');

const conn = new Client();

const SSH_CONFIG = {
  host: '148.113.6.25',
  port: 20007,
  username: 'root',
  password: 'VNciiCMQZjd07itn',
};

conn.on('ready', () => {
  const cmd = `
mkdir -p /tmp/test_c && cd /tmp/test_c
cat << 'EOF' > main.c
#include <stdio.h>
int main() {
    int n;
    scanf("%d", &n);
    printf("RESULT=%d\\n", n * 2);
    return 0;
}
EOF
gcc main.c -O2 -o main.out
echo "77" | ./main.out
echo "77" | docker run --rm -i -v /tmp/test_c:/workspace:rw -w /workspace gcc:latest ./main.out
`;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', () => conn.end());
  });
}).connect(SSH_CONFIG);
