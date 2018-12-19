const ncp = require('ncp').ncp
const fs = require('fs');


var deleteFolderRecursive = function(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index){
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

deleteFolderRecursive("./dist/");

ncp.limit = 16

ncp("./api/dist/", "./dist/", function(err) {
    if (err) {
        throw err;
    }
});