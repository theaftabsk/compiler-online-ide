const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  const cmd = `
mkdir -p /tmp/test_redirect && cd /tmp/test_redirect
touch input.txt
cat << 'EOF' > main.c
#include <stdio.h>
int main() {
    int n;
    scanf("%d", &n);
    printf("REDIRECT_OK=%d\\n", n * 2);
    return 0;
}
EOF
gcc main.c -O2 -o main.out
docker run --rm -v /tmp/test_redirect:/workspace:rw -w /workspace gcc:latest sh -c "./main.out < input.txt"
`;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', () => conn.end());
  });
}).connect({ host: '148.113.6.25', port: 20007, username: 'root', password: 'VNciiCMQZjd07itn' });
