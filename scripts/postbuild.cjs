const fs = require('fs');
const path = require('path');

// Copy index.html to 404.html for SPA routing
const distPath = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distPath, 'index.html');
const notFoundPath = path.join(distPath, '404.html');

fs.copyFileSync(indexPath, notFoundPath);
console.log('404.html created successfully');