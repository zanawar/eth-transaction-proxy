import { IContract } from "./interfaces/IContract";
import { IContractSource } from "./interfaces/IContractSource";
import { ContractCache } from "./internal/ContractCache";

export type QueryCallback = (contract: IContract) => any;

export class ContractRepo {
  protected cache: ContractCache = new ContractCache();
  protected sources: IContractSource[] = [ ];

  constructor(contractSources?: IContractSource[]) {
    if (contractSources) {
      this.sources = contractSources;
    }
  }

  public getSources(): ReadonlyArray<IContractSource> {
    return this.sources;
  }

  public async getContract(contractName: string): Promise<IContract> {
    this.verifySources();
    return await this.getAndCacheContract(contractName);
  }

  public async getContractABI(contractName: string): Promise<any | undefined> {
    this.verifySources();
    const contract: IContract = await this.getAndCacheContract(contractName);
    return await contract.abi();
  }

  public async clearCache() {
    this.cache.clear();
  }

  public async precache(importABI?: boolean) {
    this.verifySources();

    const importPromises: Promise<any>[] = [];
    for (const source of this.sources) {
      const contracts = await source.list();

      contracts.forEach((contract) => {
        const cachedContract = this.cache.add(contract);
        // Fetch the abi, which will cause it to be cached
        if (importABI) {
          importPromises.push(cachedContract.abi());
        }
      });
    }

    if (importABI) {
      // Block until all contracts have been fetched
      await Promise.all(importPromises);
    }
  }

  protected async getAndCacheContract(contractName: string): Promise<IContract> {
    if (this.cache.exists(contractName)) {
      // Contract has already been cached
      return await this.cache.get(contractName);
    }

    // Query sources for contract
    const contracts = await this.querySourcesForContract(contractName);
    if (contracts.length > 1) {
      throw new Error(`Found more than one contract with name ${contractName}`);
    }
    if (contracts.length === 0) {
      throw new Error(`${contractName} could not be found.`);
    }

    // Use only the first (and only) encountered contract
    const contract = contracts[0];
    return this.cache.add(contract);
  }

  protected async querySourcesForContract(contractName: string, callback?: QueryCallback): Promise<IContract[]> {
    const found: IContract[] = [];
    const queryPromises: Promise<IContract>[] = [];

    for (const contractSource of this.sources) {
      const getPromise = contractSource.get(contractName).then(
        (contract: IContract) => {
          if (contract) {
            found.push(contract);
            if (callback) {
              callback(contract);
            }
          }

          return contract;
        },
        (error: any) => {
          throw new Error(`Unhandled error when getting ${contractName} from source: ${error}`);
        });
      queryPromises.push(getPromise);
    }

    // BLock until all sources have returned a list of contracts
    await Promise.all(queryPromises);

    return found;
  }

  private verifySources() {
    if (this.sources.length === 0) {
      throw new Error("No ABISources added to the Contract Repo.");
    }
  }
}
