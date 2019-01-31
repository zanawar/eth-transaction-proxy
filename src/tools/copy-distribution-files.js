const fs = require('fs');
const copyNodeModules = require('copy-node-modules');
const cpr = require('cpr').cpr;

async function run() {
  let binFolder = '../bin/eth-transaction-proxy'
  let localPackageJson = './package.json';
  let targetPackageJson = binFolder + '/package.json';

  let shouldCopy = true;
  if (fs.existsSync(targetPackageJson)) {
    console.log('package.json already exists in bin folder.');
    let localStats = fs.statSync(localPackageJson);
    let targetStats = fs.statSync(targetPackageJson);

    // Don't copy if local is older than target
    if (targetStats.ctimeMs > localStats.ctimeMs) {
      shouldCopy = false;
    } else {
      console.log('package.json has changed and needs to be updated.');
    }
  }

  if (fs.existsSync("../README.md")) {
    console.log('Copying README.md');
    fs.copyFileSync('../README.md', binFolder + '/README.md');
  }

  if (shouldCopy) {
    console.log('Copying package json files');
    fs.copyFileSync('./package.json', binFolder + '/package.json');
    fs.copyFileSync('./package-lock.json', binFolder + '/package-lock.json');
  }

  console.log('Copying node modules');
  await new Promise((resolve, reject) => {
    copyNodeModules('./',
      binFolder,
      {
        concurrency: 16
      },
      (err, results) => {
        if (err) {
          reject(err);
        }

        resolve(results);
      });
  });

  console.log('Copying node modules bin');
  await new Promise((resolve, reject) => {
    cpr('./node_modules/.bin',
      binFolder + '/node_modules/.bin',
      {
        overwrite: true
      },
      function (err) {
        if (err) {
          reject(err);
        }
        resolve();
    });
  });

  console.log('Build success.');
}

try {
  run();
} catch (e) {
  console.error(e);
}
