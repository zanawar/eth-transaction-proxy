const fs = require('fs');
const path = require('path');
const ncp = require('ncp').ncp;
const cpr = require('cpr').cpr;
const execSync = require('npm-run').execSync;
const copyNodeModules = require('copy-node-modules');

async function run() {
  let localPackageJson = './package.json';
  let targetPackageJson = '../bin/test/package.json';
  let shouldCopy = true;

  if (fs.existsSync(targetPackageJson)) {
    console.log("package.json already exists in bin folder.");
    let localStats = fs.statSync(localPackageJson);
    let targetStats = fs.statSync(targetPackageJson);

    // Don't copy if local is older than target
    if (targetStats.ctimeMs > localStats.ctimeMs) {
      shouldCopy = false;
    } else {
      console.log("package.json has changed and needs to be updated.");
    }
  }

  if (shouldCopy) {
    console.log("Copying package.json to bin folder");
    fs.copyFileSync(localPackageJson, targetPackageJson);
  }



  console.log("Copying contracts to bin folder.");
  await new Promise((resolve, reject) => {
    cpr('./contracts',
    '../bin/test/contracts',
    {
      overwrite: true
    },
    function (err, files) {
      if (err) {
        reject(err);
      }

      resolve(files);
    });
  })

  if (shouldCopy) {
    console.log("Copying node modules...");
    const srcDir = "./";
    const destDir = "../bin/test";
    
    await new Promise((resolve, reject) => {
      copyNodeModules(srcDir,
        destDir,
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

    console.log("Copying node modules bin...");
    await new Promise((resolve, reject) => {
      cpr('./node_modules/.bin',
        '../bin/test/node_modules/.bin',
        {
          overwrite: true
        },
        function (err) {
          if (err) {
            reject(err);
          }
      
          resolve();
      });
      
    })

    console.log("Installing needed packages for tests...");
    try {
      // Run the `npm run compile` script which will re-install
      // npm packages required by the tests
      const postBuildCommand = "npm run compile";
      let output = execSync(postBuildCommand, {
        cwd: process.cwd(),
        stdio: 'inherit'
      });
      console.log("Install success.");
    } catch (ex) {
      console.log("An error occurred when installing npm packages for the compiled tests!");
    }
  }
}

try {
  run();
} catch (e) {
  console.error(e);
}
