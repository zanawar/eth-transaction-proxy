import * as assert from "assert";
import { IABIMetadata } from "../interfaces/IABIMetadata";

export class ABIData {
  private abi?: any;
  private metadata?: IABIMetadata;

  constructor(abi?: any, metadata?: IABIMetadata) {
    this.abi = abi;
    this.metadata = metadata;

    assert.equal(!abi && !metadata, false, "Error: You must construct ABI data with an abi or metadata.");
  }

  public getContractName(): string {
    if (this.abi) {
      return this.abi.contractName;
    } else if (this.metadata) {
      return this.metadata.contractName;
    } else {
      assert.fail("Error: This should never happen.");
    }

    return "";
  }

  public async getABI(): Promise<any | undefined> {
    if (this.abi) {
      return this.abi;
    } else if (this.metadata) {
      this.abi = await this.metadata.getABI();
      return this.abi;
    } else {
      assert.fail("Error: This should never happen.");
    }

    return undefined;
  }
}