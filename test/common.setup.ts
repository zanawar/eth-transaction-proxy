import * as fs from "fs";
import * as find from "find";

export const abiDirectory: string = "./contracts";
export const migrationContract: string = "Migrations";
export const testBedContract: string = "TestBed";

export const setup = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.exists(abiDirectory, (exists: boolean) => {
      if (!exists || !areABIsBuilt()) {
        reject("Could not find contracts.");
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