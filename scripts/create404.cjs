const fs = require('fs');
const path = require('path');

function ensure404() {
  const distDir = path.resolve(__dirname, '..', 'dist');
  const indexPath = path.join(distDir, 'index.html');
  const notFoundPath = path.join(distDir, '404.html');

  if (!fs.existsSync(distDir)) {
    console.warn('[postbuild] dist/ does not exist. Skipping 404.html generation.');
    return;
  }

  if (!fs.existsSync(indexPath)) {
    console.warn('[postbuild] dist/index.html does not exist. Skipping 404.html generation.');
    return;
  }

  fs.copyFileSync(indexPath, notFoundPath);
  console.log('[postbuild] Generated dist/404.html for SPA routing fallback.');
}

ensure404();
