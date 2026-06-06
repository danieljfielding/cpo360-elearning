const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.mp4':  'video/mp4',
  '.webm': 'video/webm',
  '.xml':  'application/xml',
  '.txt':  'text/plain',
};

const server = http.createServer((req, res) => {
  // Strip query string
  let urlPath = req.url.split('?')[0];

  // Default to index.html at root
  if (urlPath === '/') urlPath = '/index.html';

  // Add .html extension if missing and no extension present
  if (!path.extname(urlPath) && !urlPath.endsWith('/')) {
    urlPath = urlPath + '.html';
  }

  const filePath = path.join(__dirname, urlPath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Try index.html for directories
      const indexPath = path.join(__dirname, urlPath.replace(/\.html$/, ''), 'index.html');
      fs.readFile(indexPath, (err2, data2) => {
        if (err2) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not found: ' + urlPath);
        } else {
          res.writeHead(200, {
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': '*',
            'X-Frame-Options': 'ALLOWALL',
          });
          res.end(data2);
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'X-Frame-Options': 'ALLOWALL',
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('eLearning server running on port ' + PORT);
});
