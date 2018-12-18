import * as storage from "azure-storage";
import { IABIMetadata } from "../../interfaces/IABIMetadata";
import { BlobContract } from "./BlobContract";
import { parseABI, readContract } from "./BlobUtils";

export class BlobABIMetadata implements IABIMetadata {
  public readonly containerName: string;
  public readonly contractName: string;
  public readonly blobService: storage.BlobService;

  constructor(blobService: storage.BlobService, containerName: string, contractName: string) {
    this.containerName = containerName;
    this.contractName = contractName;
    this.blobService = blobService;
  }

  public getABI(): Promise<any> {
    return new Promise((resolve, reject) => {

      // read a specific contract (blob) in the specified container name, pass in the "false" flag to read the full
      // contract for gathering the ABI
      readContract(this.blobService, this.containerName, this.contractName, false).then(
        function(this: BlobABIMetadata, blobContract: BlobContract) {
          if (blobContract) {
            const json = parseABI(blobContract);
            resolve(json);
          } else {
            reject(`No contract found with the name ${this.contractName}`);
          }
        }).catch((err: any) => {
          reject(err);
        });
    });
  }
}
