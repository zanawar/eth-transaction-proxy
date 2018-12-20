const fs = require('fs');
const ncp = require('ncp').ncp

fs.copyFile('./package.json', '../bin/test/package.json', (err) => {
  if (err) throw err;
});

ncp.limit = 16;
 
ncp('./contracts', '../bin/test/contracts', function (err) {
 if (err) {
   return console.error(err);
 }
});