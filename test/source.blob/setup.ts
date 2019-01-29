// Compile Contracts
// Deploy ABI.jsons to Blob

import * as storage from "azure-storage";

export const contractName1: string = "Migrations";
export const contractName2: string = "TestBed";

export const prepareBlobStorage = (connection: string, containerName: string): Promise<void> =>
{
    return new Promise((resolve, reject) => {
        // Upload Contract .json files to blob storage
        const blobService = storage.createBlobService(connection);
        blobService.createContainerIfNotExists(containerName, (err) => {
          if (err) {
            reject(err);
          }

          let dummyAbi1 = { contractName: `${contractName1}` }
          let dummyAbi2 = { contractName: `${contractName2}` }
          
          blobService.createBlockBlobFromText(containerName, contractName1 + ".json", JSON.stringify(dummyAbi1), (err) => {
            if (err) {
              reject(err);
            }

            blobService.createBlockBlobFromText(containerName, contractName2 + ".json", JSON.stringify(dummyAbi2), (err) => {
              if (err) {
                reject(err);
              }

              resolve();
            });

            
          });
          
        });
        
    });
}

