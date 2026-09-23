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

// Arquivos do servidor que nao devem ser servidos ao publico
const BLOQUEADOS = new Set(['/server.js', '/package.json', '/package-lock.json', '/README.md']);

// URLs antigas dos blogs: redireciona 301 para as reais
const REDIRECIONA = {
  '/index.html': '/',
  '/blog/lei-14300-fio-b.html': '/blog-lei14300.html',
  '/blog/energia-solar-vale-a-pena-2026.html': '/blog-solar2026.html',
  '/blog/bateria-x-gerador.html': '/blog-bateria-gerador.html'
};

const PAGINA_404 = '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<meta name="robots" content="noindex"><title>Pagina nao encontrada . Nikola Energia</title>' +
  '<style>body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:Montserrat,Arial,sans-serif;' +
  'background:#0a1440;color:#fff;text-align:center;padding:24px}h1{font-size:28px;margin:0 0 8px}' +
  'p{opacity:.8;margin:0 0 24px}a{display:inline-block;background:linear-gradient(90deg,#0046FF,#712DE2);' +
  'color:#fff;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:99px}</style></head>' +
  '<body><div><h1>Pagina nao encontrada</h1><p>Esse endereco nao existe, mas a economia na sua conta de luz existe.</p>' +
  '<a href="/">Voltar para a Nikola Energia</a></div></body></html>';

function naoAchou(res) {
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(PAGINA_404);
}

const server = http.createServer((req, res) => {
  try {
    let p = decodeURIComponent((req.url || '/').split('?')[0]);
    if (REDIRECIONA[p]) { res.writeHead(301, { Location: REDIRECIONA[p] }); return res.end(); }
    if (p === '/' || p === '') p = '/index.html';
    if (BLOQUEADOS.has(p) || p.split('/').some(s => s.startsWith('.'))) return naoAchou(res);
    const file = path.join(dir, p);
    if (!file.startsWith(dir + path.sep)) { res.writeHead(403); return res.end('forbidden'); }
    fs.stat(file, (e, st) => {
      if (e || !st.isFile()) return naoAchou(res);
      fs.readFile(file, (err, data) => {
        if (err) return naoAchou(res);
        const ext = path.extname(file).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'public, max-age=3600' });
        res.end(data);
      });
    });
  } catch (e) {
    res.writeHead(400); res.end('requisicao invalida');
  }
});

const port = process.env.PORT || 8080;
server.listen(port, () => console.log('Nikola site no ar na porta ' + port));
