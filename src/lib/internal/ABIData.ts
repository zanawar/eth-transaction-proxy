import * as assert from "assert";
import { IContract } from "../interfaces/IContract";

export class ABIData {
  private cachedAbi?: any;
  private metadata?: IContract;

  constructor(abi?: any, metadata?: IContract) {
    this.cachedAbi = abi;
    this.metadata = metadata;

    assert.equal(!abi && !metadata, false, "Error: You must construct ABI data with an abi or metadata.");
  }

  public getContractName(): string {
    if (this.cachedAbi) {
      return this.cachedAbi.contractName;
    } else if (this.metadata) {
      return this.metadata.contractName;
    } else {
      assert.fail("Error: This should never happen.");
    }

    return "";
  }

  public async abi(): Promise<any | undefined> {
    if (this.cachedAbi) {
      return this.cachedAbi;
    } else if (this.metadata) {
      this.cachedAbi = await this.metadata.abi();
      return this.cachedAbi;
    } else {
      assert.fail("Error: This should never happen.");
    }

    return undefined;
  }
}
