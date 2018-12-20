import { IContract } from "../interfaces/IContract";

export class CachedContract implements IContract {
  private _contract : IContract;
  private _cachedABI : any;

  constructor(contract: IContract) {
    this._contract = contract;
    this._cachedABI = null;
  }

  public name() : string {
    return this._contract.name();
  }

  public abi(): Promise<any> {
    if (this._cachedABI) {
      return new Promise((resolve) => {
        resolve(this._cachedABI);
      });
    }
    
    return this._contract.abi().then((abi : any) => {
      this._cachedABI = abi;
      return abi;
    });
  }
}
