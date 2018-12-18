import * as fs from "fs";
import * as find from "find";
import * as child from "child_process";

export const abiDirectory: string = "./contracts/build/contracts";
export const migrationContract: string = "Migrations";
export const testBedContract: string = "TestBed";

export const setup = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.exists(abiDirectory, (exists: boolean) => {
      if (!exists || !areABIsBuilt()) {
        resolve(buildABIs());
      } else {
        resolve();
      }
    });
  });
}

const areABIsBuilt = (): boolean => {
  const files = find.fileSync("*.json", abiDirectory);
  return files && files.length > 0;
}

const buildABIs = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    child.exec("npm run build", { cwd: "./contracts/" }, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      }

      resolve();
    });
  });
}
