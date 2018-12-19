import { IABIMetadata } from "../../interfaces/IABIMetadata";
import { parseABI } from "./FileUtils";

export class FileABIMetadata implements IABIMetadata {
  public contractName: string;
  public filePath: string;

  constructor(contractName: string, filePath: string) {
    this.filePath = filePath;
    this.contractName = contractName;
  }

  public getABI(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const json = parseABI(this.filePath);
        resolve(json);
      } catch (e) {
        reject(e);
      }
    });
  }
}