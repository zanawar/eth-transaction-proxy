const fs = require('fs');

fs.copyFile('./package.json', '../bin/eth-transaction-proxy/package.json', (err) => {
  if (err) throw err;
});

fs.copyFile('./package-lock.json', '../bin/eth-transaction-proxy/package-lock.json', (err) => {
  if (err) throw err;
});