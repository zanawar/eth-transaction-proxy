const fs = require('fs');

fs.copyFile('package.json', 'dist/package.json', (err) => {
  if (err) throw err;
});

fs.copyFile('package-lock.json', 'dist/package-lock.json', (err) => {
  if (err) throw err;
});