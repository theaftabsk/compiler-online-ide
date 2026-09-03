const { Client } = require('ssh2');

const conn = new Client();

const SSH_CONFIG = {
  host: '148.113.6.25',
  port: 20007,
  username: 'root',
  password: 'VNciiCMQZjd07itn',
  readyTimeout: 30000,
};

function execCommand(conn, cmd) {
  return new Promise((resolve, reject) => {
    console.log(`\n[VPS EXEC] ${cmd}`);
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let output = '';
      stream.on('close', (code, signal) => {
        console.log(`[VPS EXEC] Finished with code: ${code}`);
        resolve({ code, output });
      }).on('data', (data) => {
        process.stdout.write(data.toString());
        output += data.toString();
      }).stderr.on('data', (data) => {
        process.stderr.write(data.toString());
        output += data.toString();
      });
    });
  });
}

conn.on('ready', async () => {
  console.log('✓ Connected to VPS! Starting GitHub Clone & Deployment...');

  try {
    // 1. Clean old directory
    await execCommand(conn, 'rm -rf /var/www/codelab && mkdir -p /var/www/codelab');

    // 2. Clone from GitHub
    console.log('\n--- Cloning from GitHub: https://github.com/theaftabsk/compiler-online-ide.git ---');
    await execCommand(conn, 'git clone https://github.com/theaftabsk/compiler-online-ide.git /var/www/codelab');

    // 3. Install & Build Backend (NestJS)
    console.log('\n--- Installing & Building Backend ---');
    await execCommand(conn, 'cd /var/www/codelab/backned && npm install && npm run build');

    // 4. Install & Build Frontend (Next.js 14)
    console.log('\n--- Installing & Building Frontend ---');
    await execCommand(conn, 'cd /var/www/codelab/fronted && npm install && npm run build');

    // 5. Configure Nginx Reverse Proxy
    const nginxConfig = `
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:5000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
`;
    await execCommand(conn, `cat << 'EOF' > /etc/nginx/sites-available/default\n${nginxConfig}\nEOF`);
    await execCommand(conn, 'nginx -t && systemctl restart nginx');

    // 6. Start Services with PM2
    console.log('\n--- Launching PM2 Services ---');
    await execCommand(conn, 'pm2 delete all || true');
    await execCommand(conn, 'cd /var/www/codelab/backned && pm2 start dist/main.js --name "codelab-backend"');
    await execCommand(conn, 'cd /var/www/codelab/fronted && pm2 start "npm start" --name "codelab-frontend"');
    await execCommand(conn, 'pm2 save && pm2 startup || true');

    console.log('\n--- Checking Live Status ---');
    await execCommand(conn, 'pm2 status');
    await execCommand(conn, 'free -m');
    await execCommand(conn, 'df -h /');

    console.log('\n🎉 GITHUB DEPLOYMENT TO VPS FULLY SUCCESSFUL!');
  } catch (err) {
    console.error('Deployment error:', err);
  } finally {
    conn.end();
  }
}).on('error', (err) => {
  console.error('SSH Error:', err);
}).connect(SSH_CONFIG);
