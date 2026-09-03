const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  const cmd = `
cat << 'PYEOF' > /tmp/test_api.py
import urllib.request, json
code = r"""#include <stdio.h>
int main() {
    int n;
    scanf("%d", &n);
    printf("NESTJS_RESULT=%d\n", n * 3);
    return 0;
}"""
payload = json.dumps({'language': 'c', 'code': code, 'input': '15'}).encode('utf-8')
req = urllib.request.Request('http://localhost:5000/api/code/run', data=payload, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as response:
        print(response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print('HTTP ERROR:', e.code, e.read().decode('utf-8'))
PYEOF
python3 /tmp/test_api.py
`;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', () => conn.end());
  });
}).connect({ host: '148.113.6.25', port: 20007, username: 'root', password: 'VNciiCMQZjd07itn' });
