import { IContract } from "../interfaces/IContract";
import { CachedContract } from "./CachedContract";

export class ContractCache {
  private cache: Map<string, IContract> = new Map<string, IContract>();

  public getMap(): ReadonlyMap<string, IContract> {
    return this.cache;
  }

  public add(contract: IContract): IContract {
    if (this.exists(contract.name())) {
      throw new Error(`Error: Contract ${contract.name()} already exists in cache. Contracts must have unique names.`);
    }

    const cachedContract = new CachedContract(contract);
    this.cache.set(contract.name(), cachedContract);

    return cachedContract;
  }

  public get(contractName: string): IContract {
    const contract =  this.cache.get(contractName);

    if (contract) {
      return contract;
    }

    throw new Error(`${contractName} not found in cache.`);
  }

  public exists(contractName: string): boolean {
    return this.cache.has(contractName);
  }

  public clear() {
    this.cache.clear();
  }
}
