import * as folder from "../api.folder/setup";
import { ContractRepo, FolderContractSource } from "eth-transaction-proxy";
import { ContractCache } from "eth-transaction-proxy/lib/internal/ContractCache"; 

export let FolderContractSource0: FolderContractSource;
export let FolderContractSource1: FolderContractSource;
export let FolderContractSource2: FolderContractSource;

export class TestContractRepo extends ContractRepo {
  public getCacheInternal(): ContractCache {
    return this.cache;
  }
}

export const setup = (
  buildDirectory0: string,
  buildDirectory1: string,
  buildDirectory2: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    folder.setup(buildDirectory0)
      .then(() => {
        folder.insertABI(buildDirectory1, "Test.json", { contractName: "Test" });
        folder.insertABI(buildDirectory2, "TestAgain.json", { contractName: "TestAgain" });
        FolderContractSource0 = new FolderContractSource(buildDirectory0);
        FolderContractSource1 = new FolderContractSource(buildDirectory1);
        FolderContractSource2 = new FolderContractSource(buildDirectory2);
      })
      .then(resolve)
      .catch(reject);
  });
};

export const teardown = (
  buildDirectory1: string,
  buildDirectory2: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    folder.removeABI(buildDirectory1, "Test.json");
    folder.removeABI(buildDirectory2, "TestAgain.json");
    resolve();
  });
};
