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
      stream.on('close', (code) => {
        console.log(`[VPS EXEC] Exit code: ${code}`);
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
  console.log('✓ Connected to VPS! Performing live update...');

  try {
    // 1. Pull latest commits from GitHub
    console.log('\n--- Pulling latest code from GitHub ---');
    await execCommand(conn, 'cd /var/www/codelab && git fetch origin && git reset --hard origin/main');

    // 2. Build Backend (NestJS)
    console.log('\n--- Compiling NestJS Backend ---');
    await execCommand(conn, 'cd /var/www/codelab/backned && npm run build');

    // 3. Build Frontend (Next.js)
    console.log('\n--- Compiling Next.js Frontend ---');
    await execCommand(conn, 'cd /var/www/codelab/fronted && npm run build');

    // 4. Configure Nginx for kaspro.online & api.kaspro.online
    console.log('\n--- Updating Nginx Configuration for kaspro.online ---');
    const nginxConf = `server {
    listen 80;
    server_name kaspro.online www.kaspro.online;

    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io {
        rewrite ^/socket.io$ /socket.io/ break;
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name api.kaspro.online;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`;
    await execCommand(conn, `cat << 'NGINXEOF' > /etc/nginx/sites-available/kaspro.online\n${nginxConf}\nNGINXEOF`);
    await execCommand(conn, 'ln -sf /etc/nginx/sites-available/kaspro.online /etc/nginx/sites-enabled/kaspro.online');
    await execCommand(conn, 'nginx -t && systemctl reload nginx');

    // 5. Restart PM2 Services
    console.log('\n--- Restarting PM2 Services ---');
    await execCommand(conn, 'pm2 restart all');
    await execCommand(conn, 'pm2 status');

    console.log('\n🎉 VPS UPDATE & DEPLOYMENT COMPLETE!');
  } catch (err) {
    console.error('Update failed:', err);
  } finally {
    conn.end();
  }
}).on('error', (err) => {
  console.error('SSH Error:', err);
}).connect(SSH_CONFIG);
