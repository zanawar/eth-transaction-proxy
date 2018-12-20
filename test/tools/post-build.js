const fs = require('fs');
const path = require('path');
const ncp = require('ncp').ncp
const execSync = require("child_process").execSync;

let localPackageJson = "./package.json";
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


ncp.limit = 16;

console.log("Copying contracts to bin folder.");
ncp('./contracts', '../bin/test/contracts', function (err) {
 if (err) {
   return console.error(err);
 }
});

if (shouldCopy) {
  console.log("Installing needed packages for tests...");

  let SEPARATOR = process.platform === "win32" ? ";" : ":",
    env = Object.assign({}, process.env);

  env.PATH = path.resolve("./node_modules/.bin") + SEPARATOR + env.PATH;

  const postBuildCommand = "npm run compile";
  let output = execSync(postBuildCommand, {
    cwd: process.cwd(),
    env: env,
    stdio: 'inherit'
  });
}