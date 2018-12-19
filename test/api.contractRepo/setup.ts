import * as folder from "../api.folder/setup";
import { ContractRepo, FolderABISource } from "eth-transaction-proxy";
import { ABICache } from "eth-transaction-proxy/lib/internal/ABICache"; 

export let folderABISource0: FolderABISource;
export let folderABISource1: FolderABISource;
export let folderABISource2: FolderABISource;

export class TestContractRepo extends ContractRepo {
  public getCacheInternal(): ABICache {
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
        folderABISource0 = new FolderABISource(buildDirectory0);
        folderABISource1 = new FolderABISource(buildDirectory1);
        folderABISource2 = new FolderABISource(buildDirectory2);
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
