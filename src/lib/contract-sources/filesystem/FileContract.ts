import { IContract } from "../../interfaces/IContract";
import { parseABI } from "./FileUtils";

export class FileContract implements IContract {
  public contractName: string;
  public filePath: string;

  constructor(contractName: string, filePath: string) {
    this.filePath = filePath;
    this.contractName = contractName;
  }

  public abi(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const json = parseABI(this.filePath);
        resolve(json);
      } catch (e) {
        reject(e);
      }
    });
  }

  public name(): string {
    return this.contractName;
  }
}
