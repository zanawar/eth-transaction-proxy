import { IABISource } from "./interfaces/IABISource";
import { ABICache } from "./internal/ABICache";

export class ContractRepo {
  protected cache: ABICache = new ABICache();
  protected sources: IABISource[] = [ ];

  constructor(abiSources?: IABISource[]) {
    if (abiSources) {
      this.sources = abiSources;
    }
  }

  public getSources(): ReadonlyArray<IABISource> {
    return this.sources;
  }

  public async getContractABI(contractName: string): Promise<any> {
    this.verifySources();

    // check cache
    let abi = await this.cache.tryGetABI(contractName);

    if (!abi) {
      // go through each source and query
      for (const source of this.sources) {
        abi = await source.getABI(contractName);

        if (abi) {
          this.cache.addABI(abi);
          return abi;
        }
      }
    }

    return abi;
  }

  public async cacheMetadata() {
    this.verifySources();
    this.cache.clear();

    for (const source of this.sources) {
      const metadatas = await source.getABIMetadatas();

      metadatas.forEach((metadata) => {
        this.cache.addMetadata(metadata);
      });
    }
  }

  public async cacheABIJson() {
    this.verifySources();
    this.cache.clear();

    for (const source of this.sources) {
      const abis = await source.getABIs();

      abis.forEach((abi) => {
        this.cache.addABI(abi);
      });
    }
  }

  private verifySources() {
    if (this.sources.length === 0) {
      throw new Error("Error: No ABISources added to the Contract Repo.");
    }
  }
}
