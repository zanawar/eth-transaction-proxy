import { IContract } from "./interfaces/IContract";
import { IContractSource } from "./interfaces/IContractSource";
import { ContractCache } from "./internal/ContractCache";

export type QueryCallback = (contract: IContract) => any;

export class ContractRepo {
  protected _cache: ContractCache = new ContractCache();
  protected _sources: IContractSource[] = [ ];

  constructor(contractSources?: IContractSource[]) {
    if (contractSources) {
      this._sources = contractSources;
    }
  }

  public getSources(): ReadonlyArray<IContractSource> {
    return this._sources;
  }

  public async getContract(contractName: string) : Promise<IContract> {
    this.verifySources();

    // Pull existing version of contract from cache
    if (this._cache.exists(contractName)) {
      return await this._cache.get(contractName);
    }

    return await this.getAndCacheContract(contractName);
  }

  public async getContractABI(contractName : string) : Promise<any> {
    this.verifySources();

    let contract : IContract;

    // Pull existing version of contract from cache
    if (this._cache.exists(contractName)) {
      contract = await this._cache.get(contractName);
    } else {
      contract = await this.getAndCacheContract(contractName);
    }

    return await contract.abi();
  }

  protected async getAndCacheContract(contractName : string) : Promise<IContract> {
    const contracts = await this.querySourcesForContract(contractName);

    if (contracts.length > 1) {
      throw new Error(`Found more than one contract with name ${contractName}`);
    }

    if (contractName.length == 0) {
      throw new Error(`${contractName} could not be found.`);
    }

    const contract = contracts[0];
    return this._cache.add(contract);
  }
  
  protected async querySourcesForContract(contractName : string, callback? : QueryCallback) : Promise<IContract[]> {
    let found : IContract[] = [];
    const queryPromises : Promise<IContract>[] = [];

    for (const contractSource of this._sources) {
      const getPromise = contractSource.get(contractName).then(
        (contract : IContract) => {
          if (contract) {
            found.push(contract);
            if (callback) {
              callback(contract);
            }
          }

          return contract;
        }
      )
      queryPromises.push(getPromise);
    }

    await Promise.all(queryPromises);

    return found;
  }

  public async clearCache() {
    this._cache.clear()
  }

  public async precache(importABI? : boolean) {
    this.verifySources();

    const importPromises : Promise<any>[] = [];

    for (const source of this._sources) {
      const contracts = await source.list();

      contracts.forEach((contract) => {
        const cachedContract = this._cache.add(contract);
        // Fetch the abi, which will cause it to be cached
        if (importABI) {
          importPromises.push(cachedContract.abi());
        }
      });
    }

    if (importABI) {
      await Promise.all(importPromises);
    }
  }

  private verifySources() {
    if (this._sources.length === 0) {
      throw new Error("No ABISources added to the Contract Repo.");
    }
  }
}
