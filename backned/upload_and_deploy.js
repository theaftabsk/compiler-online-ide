const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

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
    console.log(`\n[VPS EXEC] Running: ${cmd}`);
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

const localTarPath = path.resolve(__dirname, '../project.tar.gz');
const remoteTarPath = '/var/www/project.tar.gz';

conn.on('ready', () => {
  console.log('✓ SSH Connection Established!');

  conn.sftp((err, sftp) => {
    if (err) throw err;

    console.log(`Uploading ${localTarPath} to ${remoteTarPath}...`);
    const readStream = fs.createReadStream(localTarPath);
    const writeStream = sftp.createWriteStream(remoteTarPath);

    writeStream.on('close', async () => {
      console.log('✓ Project archive uploaded successfully via SFTP!');

      try {
        // 1. Extract files
        await execCommand(conn, 'rm -rf /var/www/codelab && mkdir -p /var/www/codelab');
        await execCommand(conn, 'tar -xzf /var/www/project.tar.gz -C /var/www/codelab');
        await execCommand(conn, 'rm -f /var/www/project.tar.gz');

        // 2. Install & Build Backend
        console.log('\n--- Building Backend ---');
        await execCommand(conn, 'cd /var/www/codelab/backned && npm install --production=false && npm run build');

        // 3. Install & Build Frontend
        console.log('\n--- Building Frontend ---');
        await execCommand(conn, 'cd /var/www/codelab/fronted && npm install --production=false && npm run build');

        // 4. Configure Nginx Reverse Proxy
        const nginxConfig = `
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API (NestJS)
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket Gateway
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
        await execCommand(conn, 'nginx -t && systemctl reload nginx');

        // 5. Start with PM2 Process Manager
        console.log('\n--- Starting PM2 Services ---');
        await execCommand(conn, 'pm2 delete all || true');
        await execCommand(conn, 'cd /var/www/codelab/backned && pm2 start dist/main.js --name "codelab-backend"');
        await execCommand(conn, 'cd /var/www/codelab/fronted && pm2 start "npm start" --name "codelab-frontend"');
        await execCommand(conn, 'pm2 save && pm2 startup || true');

        console.log('\n🎉 ALL SERVICES DEPLOYED AND LIVE!');
      } catch (e) {
        console.error('Deployment error:', e);
      } finally {
        conn.end();
      }
    });

    readStream.pipe(writeStream);
  });
}).on('error', (err) => {
  console.error('SSH Error:', err);
}).connect(SSH_CONFIG);
