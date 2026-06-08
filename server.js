const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
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
  '.zip':  'application/zip',
};

// All course content folders — add new ones here as courses are added
const COURSE_DIRS = [
  'scormcontent',
  'scormcontent-category-mgmt',
  'scormcontent-contract-mgmt',
  'scormcontent-ethics',
  'scormcontent-stakeholder-mgmt',
];

function serve(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.log('404:', filePath);
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found: ' + filePath);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'X-Frame-Options': 'ALLOWALL',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  // Strip query string
  let urlPath = req.url.split('?')[0];
  // Decode URI
  try { urlPath = decodeURIComponent(urlPath); } catch(e) {}

  console.log('GET', urlPath);

  // Root
  if (urlPath === '/') {
    return serve(res, path.join(__dirname, 'index.html'));
  }

  // Rewrite bare /lib/ and /assets/ to the correct course folder
  // Rise requests these as root-relative paths — we need to find which course they belong to
  if (urlPath.startsWith('/lib/') || urlPath.startsWith('/assets/')) {
    // Check each course dir to find which one has the file
    let found = false;
    const checks = COURSE_DIRS.map(dir => path.join(__dirname, dir, urlPath));

    function tryNext(i) {
      if (i >= checks.length) {
        // Not found in any course dir — try root
        return serve(res, path.join(__dirname, urlPath));
      }
      fs.stat(checks[i], (err, stat) => {
        if (!err && stat.isFile()) {
          return serve(res, checks[i]);
        }
        tryNext(i + 1);
      });
    }
    return tryNext(0);
  }

  const fsPath = path.join(__dirname, urlPath);

  // Check if exact file exists
  fs.stat(fsPath, (err, stat) => {
    if (!err && stat.isFile()) {
      return serve(res, fsPath);
    }

    // Check if it's a directory — serve index.html inside it
    if (!err && stat.isDirectory()) {
      return serve(res, path.join(fsPath, 'index.html'));
    }

    // Try adding .html extension
    const htmlPath = fsPath + '.html';
    fs.stat(htmlPath, (err2, stat2) => {
      if (!err2 && stat2.isFile()) {
        return serve(res, htmlPath);
      }

      // Not found
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found: ' + urlPath);
    });
  });
});

server.listen(PORT, () => {
  console.log('eLearning server running on port ' + PORT);
});
