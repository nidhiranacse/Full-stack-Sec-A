const http = require('http');
const fs = require('fs');
const path = require('path');

const errorMap = {
    '/400': { code: 400, file: '400.html', text: '400 - Bad Request' },
    '/401': { code: 401, file: '401.html', text: '401 - Unauthorized' },
    '/403': { code: 403, file: '403.html', text: '403 - Forbidden' },
    '/404': { code: 404, file: '404.html', text: '404 - Not Found' },
    '/408': { code: 408, file: '408.html', text: '408 - Request Timeout' },
    '/500': { code: 500, file: '500.html', text: '500 - Internal Server Error' },
    '/502': { code: 502, file: '502.html', text: '502 - Bad Gateway' },
    '/503': { code: 503, file: '503.html', text: '503 - Service Unavailable' }
};

const server = http.createServer((req, res) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);

    // Home Page
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
        return;
    }

    // Match Error Routes
    const cleanUrl = req.url.replace('.html', '');
    if (errorMap[cleanUrl]) {
        const { code, file, text } = errorMap[cleanUrl];
        const filePath = path.join(__dirname, file);

        fs.readFile(filePath, (err, data) => {
            res.writeHead(code, { 'Content-Type': 'text/html' });
            if (err) {
                res.end(`<!DOCTYPE html><html><body><h1>${code}</h1><p>${text}</p><a href="/">Go Home</a></body></html>`);
            } else {
                res.end(data);
            }
        });
        return;
    }

    // Default 404 for any other missing routes
    fs.readFile(path.join(__dirname, '404.html'), (err, data) => {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        if (err) {
            res.end('<!DOCTYPE html><html><body><h1>404</h1><p>Page Not Found</p><a href="/">Go Home</a></body></html>');
        } else {
            res.end(data);
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`\n===========================================`);
    console.log(` Server running at http://localhost:${PORT}`);
    console.log(` Open http://localhost:${PORT} in your browser`);
    console.log(`===========================================\n`);
});
