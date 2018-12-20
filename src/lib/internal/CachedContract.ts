import { IContract } from "../interfaces/IContract";

export class CachedContract implements IContract {
  private contract: IContract;
  private cachedABI: any;

  constructor(contract: IContract) {
    this.contract = contract;
    this.cachedABI = null;
  }

  public name(): string {
    return this.contract.name();
  }

  public abi(): Promise<any> {
    if (this.cachedABI) {
      return new Promise((resolve) => {
        resolve(this.cachedABI);
      });
    }

    return this.contract.abi().then((abi: any) => {
      this.cachedABI = abi;
      return abi;
    });
  }
}
