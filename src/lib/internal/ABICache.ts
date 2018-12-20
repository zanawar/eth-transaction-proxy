import { IContract } from "../interfaces/IContract";
import { ABIData } from "./ABIData";

export class ABICache {
  private cache: Map<string, ABIData> = new Map<string, ABIData>();

  public getMap(): ReadonlyMap<string, ABIData> {
    return this.cache;
  }

  public addMetadata(metadata: IContract) {
    this.verifyUnique(metadata.contractName);
    this.cache.set(metadata.contractName, new ABIData(undefined, metadata));
  }

  public addABI(abi: any) {
    if (abi === undefined || abi.contractName === undefined) {
      if (abi) {
        throw new Error(`Error: The abi doesn't have a 'contractName' member.\n${JSON.stringify(abi, null, 2)}`);
      } else {
        throw new Error("Error: The abi is undefined.");
      }
    }

    this.verifyUnique(abi.contractName);

    this.cache.set(abi.contractName, new ABIData(abi, undefined));
  }

  public tryGetABI(contractName: string): Promise<any | undefined> {
    const cached = this.cache.get(contractName);

    if (cached !== undefined) {
      return cached.abi();
    }

    return new Promise((resolve) => resolve(undefined));
  }

  public clear() {
    this.cache.clear();
  }

  private verifyUnique(contractName: string) {
    if (this.cache.has(contractName)) {
      throw new Error("Error: Contract already exists in cache. Contracts must have unique names.");
    }
  }
}
