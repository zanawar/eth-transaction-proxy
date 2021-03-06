import * as storage from "azure-storage";
import { IContract } from "../../interfaces/IContract";
import { IContractSource } from "../../interfaces/IContractSource";
import { AzureBlobContract } from "./AzureBlobContract";
import { BlobContract } from "./BlobContract";
import { containerExists, readAllContracts, readContract, tryGetABIMetadata } from "./BlobUtils";

export class AzureBlobContractSource implements IContractSource {
  private blobService: storage.BlobService;
  private containerName: string;

  constructor(connectionString: string, containerName: string) {
    try {
      this.blobService = storage.createBlobService(connectionString);
    } catch (e) {
      throw new Error(`Could not connect to blob storage.  Double check your connection string.`);
    }

    this.containerName = containerName;
  }

  public validateConnection(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // look up the contracts container to see if it exists for this storage account
      if (this.blobService) {
        containerExists(this.blobService, this.containerName).then((result) => {
          resolve(result);
        }).catch((err: any) => {
          resolve(false);
        });
      } else {
        throw new Error(`The blob service has not been initialized yet.`);
      }
    });
  }

  // loop through all contracts and gather the metadata for each
  public list(): Promise<IContract[]> {
    return new Promise((resolve, reject) => {
      const metadatas = [] as AzureBlobContract[];

      // read all contracts (blobs) in the specified container name, pass in the "true" flag to only read a
      // partial of the contract for metadata searching only
      readAllContracts(this.blobService, this.containerName, true).then(
        (data: BlobContract[]) => {
        for (const blobContract of data) {
          const metadata = tryGetABIMetadata(this.blobService, blobContract);

          if (metadata !== undefined) {
            metadatas.push(metadata);
          }
        }

        resolve(metadatas);
      }).catch((e: any) => {
        reject(e);
      });
    });
  }

  // gather the abi for one contract specifically
  public get(contractName: string): Promise<IContract> {
    return new Promise((resolve, reject) => {

      // read a specific contract (blob) in the specified container name, pass in the
      // "false" flag to read the full contract for gathering the ABI
      readContract(this.blobService, this.containerName, `${contractName}.json`, false).then(
        (blobContract: BlobContract) => {
        if (blobContract) {
          const metadata = tryGetABIMetadata(this.blobService, blobContract);
          if (metadata !== undefined) {
            resolve(metadata);
          }
        } else {
          reject(`No item in blob found with the name ${contractName}.json`);
        }
      }).catch((err: any) => {
        reject(err);
      });
    });
  }
}
