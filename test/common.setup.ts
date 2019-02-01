import * as fs from "fs";

export const abiDirectory: string = "./contracts";
export const migrationContract: string = "Migrations";
export const testBedContract: string = "TestBed";


export const setup = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const doesExist = fs.existsSync(exports.abiDirectory);

    if (doesExist && areABIsBuilt()) {
      resolve();
    } else {
      reject(Error("Contract files are missing."));
    }
  });
}

const areABIsBuilt = (): boolean => {
  const files = fs.readdirSync(abiDirectory)
  return files && files.length > 0;
}