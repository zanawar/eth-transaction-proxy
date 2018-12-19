var fs = require('fs');
var path = require('path');
var resolve = require('path').resolve;
var cp = require('child_process');
var os = require('os');

var npmCmd = os.platform().startsWith('win') ? 'npm.cmd' : 'npm';
var root = resolve(__dirname, '../');

// List all package.json files in subdirectories
var walkSync = function(dir, filelist) {
  files = fs.readdirSync(dir);

  filelist = filelist || [];

  files.forEach(function(file) {
    filepath = dir + '/' + file;
    
    if (fs.statSync(filepath).isDirectory()) {
      filelist = walkSync(filepath, filelist);
    }
    else if (filepath.indexOf('package.json') > -1 &&
             filepath.indexOf('node_modules') == -1) {
      filelist.push(filepath);
    }
  });

  return filelist;
}

packagejsonfiles = walkSync(root);

packagejsonfiles.forEach(function(file) {

  // skip the root directory's package.json to avoid infinite loop
  if (file == root + '/package.json') {
    return;
  }

  cp.spawn(npmCmd, ['i'], { env: process.env, cwd: path.dirname(file), stdio: 'inherit' });
});
