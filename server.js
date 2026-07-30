const http = require('http');
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml'
};

const server = http.createServer((req, res) => {
  try {
    let p = decodeURIComponent((req.url || '/').split('?')[0]);
    if (p === '/' || p === '') p = '/index.html';
    let file = path.join(dir, p);
    if (!file.startsWith(dir)) { res.writeHead(403); return res.end('forbidden'); }
    fs.readFile(file, (err, data) => {
      if (err) {
        // fallback: se nao achar, serve index.html (SPA-friendly)
        fs.readFile(path.join(dir, 'index.html'), (e2, home) => {
          if (e2) { res.writeHead(404); return res.end('404'); }
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(home);
        });
        return;
      }
      const ext = path.extname(file).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'public, max-age=3600' });
      res.end(data);
    });
  } catch (e) {
    res.writeHead(500); res.end('erro');
  }
});

const port = process.env.PORT || 8080;
server.listen(port, () => console.log('Nikola site no ar na porta ' + port));
