import * as storage from "azure-storage";
import { BlobABIMetadata } from "./BlobABIMetadata";
import { BlobContract } from "./BlobContract";

// we are expecting just the partial data of the contract here to make sure it contains the correct
// metadata we're looking for
export const tryGetABIMetadata =
    (blobService: storage.BlobService, blobContract: BlobContract): BlobABIMetadata | undefined => {

        const match = blobContract.blobData.match("\"contractName\"\\s?:\\s?\"(.*)\"");

        if (match && match.length > 0) {
            // we have a name, let's create the metadata and be done
            const contractName = match[1];

            if (contractName.toLowerCase() === blobContract.getContractName().toLowerCase()) {
                return new BlobABIMetadata(blobService, blobContract.containerName, blobContract.blobName);
            } else {
                throw new Error(`Error: Contract name does not match what is in contract file.`);
            }

        }

        return undefined;
    };

// we are expecting the full blob contents here to do a parse of the contract
export const parseABI = (blobContract: BlobContract): any => {
    try {
        const json = JSON.parse(blobContract.blobData);

        if (!json.contractName) {
            throw new Error(`Error: ABI missing "contractName" property\n${blobContract.blobData}\n${json}`);
        }

        if (json.contractName.toLowerCase() !== blobContract.getContractName().toLowerCase()) {
            throw new Error(`Error: "contractName" does not match up to blob name in storage.\n
            Contract Name in JSON : ${json.contractName}\nContract Name for Blob :
            ${blobContract.getContractName()}`);
        }

        return json;
    } catch (e) {
        throw new Error(`Error: exception while parsing json\n${e}`);
    }
};

// determines if a container exists in blob storage
export const containerExists = (
    blobService: storage.BlobService,
    containerName: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        blobService.doesContainerExist(containerName, (err: any, result: storage.BlobService.ContainerResult) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.exists);
            }
        });
    });
};

// lists contracts under a specific container name
export const listContracts = (
    blobService: storage.BlobService,
    containerName: string): Promise<storage.BlobService.BlobResult[]> => {
    return new Promise((resolve, reject) => {
        const token: storage.common.ContinuationToken = {
            nextMarker: "",
            targetLocation: 0,
        };

        blobService.listBlobsSegmented(containerName, token, (err: any, data: storage.BlobService.ListBlobsResult) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.entries);
            }
        });
    });
};

// reads a contract and returns the text, you can pass in the "partialRead" boolean flag to grab the first 128
// bytes of the blob or grab the entire blob contents
export const readContract = (
    blobService: storage.BlobService,
    containerName: string,
    blobName: string,
    partialRead: boolean = false): Promise<BlobContract> => {
    return new Promise((resolve, reject) => {

        const options: storage.BlobService.GetBlobRequestOptions = {};

        if (partialRead) {
            options.rangeStart = 0;
            options.rangeEnd = 128;
        }

        blobService.getBlobToText(containerName, blobName, options, (err: any, data: string) => {
            if (err) {
                reject(err);
            } else {
                resolve(new BlobContract(containerName, blobName, data));
            }
        });
    });
};

// read all the contracts in a given container, you can pass in the "partialRead" boolean flag to grab the first 128
// bytes of the blob or grab the entire blob contents
export const readAllContracts = (
    blobService: storage.BlobService,
    containerName: string,
    partialRead: boolean = false): Promise<BlobContract[]> => {
    return new Promise((resolve, reject) => {
        listContracts(blobService, containerName).then((data: storage.BlobService.BlobResult[]) => {
            const promiseArray = [];

            for (const blobItem of data) {
                promiseArray.push(readContract(blobService, containerName, blobItem.name, partialRead));
            }

            return Promise.all(promiseArray);
        }).then((data: BlobContract[]) => {
            resolve(data);
        }).catch((err: any) => {
            reject(err);
        });
    });
};
