import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    let dirPath = path.join(dir, file);
    if (fs.statSync(dirPath).isDirectory()) {
      walk(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

walk('apps/web/src', (filePath) => {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content.replace(/from\s+['"]\.\.?\/(?:\.\.\/)*(?:services|utils|types)\/.*?['"]/g, "from '@hastkala/core'");
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent);
      console.log(`Updated ${filePath}`);
    }
  }
});
