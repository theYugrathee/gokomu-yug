const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT1 = 3001;
const PORT2 = 3002;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Function to get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Request handler function
function requestHandler(req, res) {
  console.log(`Request received: ${req.method} ${req.url}`);
  
  let filePath = '.' + req.url;
  
  // Serve index.html for root path
  if (filePath === './') {
    filePath = './index.html';
  }
  
  const extname = path.extname(filePath);
  let contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found
        fs.readFile('./index.html', (err, content) => {
          if (err) {
            res.writeHead(500);
            res.end('Sorry, check with the site admin for error: ' + err.code);
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        // Server error
        res.writeHead(500);
        res.end('Sorry, check with the site admin for error: ' + err.code);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
}

// Create two servers
const server1 = http.createServer(requestHandler);
const server2 = http.createServer(requestHandler);

// Start server 1
server1.listen(PORT1, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log(`Server 1 running at http://localhost:${PORT1}/`);
  console.log(`Access from other devices on your network: http://${localIP}:${PORT1}/`);
});

// Start server 2
server2.listen(PORT2, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log(`Server 2 running at http://localhost:${PORT2}/`);
  console.log(`Access from other devices on your network: http://${localIP}:${PORT2}/`);
});

console.log('Press Ctrl+C to stop both servers');