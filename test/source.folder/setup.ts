import * as common from "../common.setup";
import { ncp } from "ncp";
import * as mkdirp from "mkdirp";
import * as fs from "fs";

const deleteFolderRecursive = function(path : string) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file : string, index : any){
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

const cleanBuildFolder = (deployFolder: string): Promise<void> => {
  return new Promise((resolve) => {
    deleteFolderRecursive(`${deployFolder}`);
    resolve();
  });
};

export const setup = (deployFolder: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    common.setup()
          .then(() => {
            mkdirp.sync(deployFolder);
          })
          .then(() => {
            return cleanBuildFolder(deployFolder);
          })
          .then(() => {
            // copy the files
            ncp(common.abiDirectory, deployFolder, (err: Error) => {
              if (err) {
                reject(err);
              }

              resolve();
            });
          })
          .catch((err: Error) => {
            reject(err);
          });
  });
};

export const insertABI = (directory: string, fileName: string, abi: any, isPretty: boolean = true) => {
  let jsonStr: string;

  if (abi === undefined) {
    jsonStr = "";
  }
  else if (!isPretty) {
    jsonStr = JSON.stringify(abi);
  } else {
    jsonStr = JSON.stringify(abi, null, 2);
  }

  mkdirp.sync(directory);

  const filePath = `${directory}/${fileName}`;

  fs.writeFileSync(filePath, jsonStr);
};

export const removeABI = (directory: string, fileName: string) => {
  const filePath = `${directory}/${fileName}`;

  const isFile = fs.lstatSync(filePath).isFile();

  if (isFile) {
    //fs.unlinkSync(filePath);

    
  }
};
