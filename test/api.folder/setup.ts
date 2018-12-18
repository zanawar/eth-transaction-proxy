import * as common from "../common.setup";
import { ncp } from "ncp";
import * as rimraf from "rimraf";
import * as mkdirp from "mkdirp";
import * as fs from "fs";

const cleanBuildFolder = (deployFolder: string): Promise<void> => {
  return new Promise((resolve) => {
    rimraf(`${deployFolder}/*`, () => resolve());
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
  fs.writeFileSync(`${directory}/${fileName}`, jsonStr);
};

export const removeABI = (directory: string, fileName: string) => {
  rimraf.sync(`${directory}/${fileName}`);
};
