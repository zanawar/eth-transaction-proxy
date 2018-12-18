import * as storage from "azure-storage";
import * as common from "../common.setup";
import * as request from "request";
import * as path from "path";
import Web3 = require("web3");
import * as fs from "fs";

export var blobService: storage.BlobService;
export const accountAddr: string = "0xb8CE9ab6943e0eCED004cDe8e3bBed6568B2Fa01";
export const accountPriv: string = "0x348ce564d427a3311b6536bbcff9390d69395b06ed6c486954e971d960fe8709";
export var testBedContractAddr: string;
export var web3: Web3;

const testEndpoint = (url: string, desiredResCode: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    request.post(url, undefined, (err, res, body) => {
      if (err) {
        reject(err);
      } else if (res.statusCode === desiredResCode) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

const testBlobCreateContainer = (blobConnect: string, containerName: string): Promise<void> => {
  blobService = storage.createBlobService(blobConnect);

  return new Promise((resolve, reject) => {
    if (!blobService) {
      reject(new Error(`Error: The Blob Emulator is unavailable at ${blobConnect}.`));
    } else {
      blobService.createContainerIfNotExists(containerName, (err, result) => {
        if (!err) {
          resolve();
        } else {
            reject(new Error(`Error: The Blob Emulator is unavailable at ${blobConnect}.\n${err}`));
        }
      });
    }
  });
};

const doesBlobExist = (containerName: string, blobName: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!blobService) {
      reject(new Error("Error: The Blob Emulator is not created."));
      return;
    }

    blobService.doesBlobExist(containerName, blobName, (err, result) => {
      if (err) {
        reject(err);
      } else if (result.exists) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

const uploadAbiToBlob = (abiFilePath: string, containerName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!blobService) {
      reject(new Error(`Error: The Blob Emulator is not created.`));
      return;
    }

    const abiFileName = path.basename(abiFilePath);

    return doesBlobExist(containerName, abiFileName)
      .then((result) => {
        if (!result) {
          blobService.createBlockBlobFromLocalFile(containerName, abiFileName, abiFilePath, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        } else {
          resolve();
        }
      })
      .catch(reject);
  });
};

const uploadAbisToGanache = (abiFilePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const abi = JSON.parse(fs.readFileSync(abiFilePath, "utf8"));
    const abiDesc = abi.abi;

    const contract = new web3.eth.Contract(abiDesc);

    contract.deploy({
      data: abi.bytecode,
      arguments: []
    }).send({
      from: accountAddr,
      gas: 4712388
    })
    .then((instance) => {
      // save the contract's address
      testBedContractAddr = instance.options.address;
      resolve();
    })
    .catch(reject);
  });
}

export const setup = (functionUrl: string, ganacheUrl: string, blobConnect: string, blobContainer: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const abiFilePath = `${common.abiDirectory}/${common.testBedContract}.json`;

    common.setup()
      .then(() => {
        // make sure the function host is up
        return testEndpoint(functionUrl, 200);
      })
      .then((result) => {
        if (!result) {
          reject(new Error(`Error: The Function Host is unavailable at ${functionUrl}.`));
        }

        // make sure ganache is up
        return testEndpoint(ganacheUrl, 400);
      })
      .then((result) => {
        if (!result) {
          reject(new Error(`Error: The Ganache Instance is unavailable at ${ganacheUrl}.`))
        }

        // make sure blob is up
        return testBlobCreateContainer(blobConnect, blobContainer);
      })
      .then(() => {
        // deploy contract ABIs to blob
        return uploadAbiToBlob(abiFilePath, blobContainer);
      })
      .then(() => {
        // initialize a web3 instance
        web3 = new Web3(ganacheUrl);

        // deploy contracts to ganache
        return uploadAbisToGanache(abiFilePath);
      })
      .then(resolve)
      .catch((err: Error) => {
        reject(err);
      });
    });
};
