// Compile Contracts
// Deploy ABI.jsons to Blob

import * as azure from "azure-storage";

const sinon = require("sinon");
const proxyquire = require("proxyquire").noCallThru();

export const mockedContractNames = [
  "Migrations",
  "TestBed"
];
export const mockedConnectionString = "connection_string";
export const mockedContainerName = "testcontracts";

const blobServiceStub = {
  createContainerIfNotExists: sinon.stub().callsArgWith(1, null),
  doesContainerExist: sinon.stub().callsFake((container: string, callback: (err: any, result: azure.BlobService.ContainerResult, response: any) => void) => {
    callback(
      null,
      {
        exists: container == mockedContainerName
      } as azure.BlobService.ContainerResult,
      null);
  }),
  listBlobsSegmented: sinon.stub().callsFake((containerName: string, token: any, callback: (err: any, result: azure.BlobService.ListBlobsResult, response: any) => void) => {
    const fakeResults : azure.BlobService.BlobResult[] = [];
    for (let i in mockedContractNames) {
      fakeResults.push({
        name: mockedContractNames[i] + ".json"
      } as azure.BlobService.BlobResult);
    }

    const result : azure.BlobService.ListBlobsResult = {
      entries: fakeResults
    };

    callback(
      null,
      result,
      null);
  }),
  getBlobToText: sinon.stub().callsFake((container: string, blob: string, options: azure.BlobService.GetBlobRequestOptions, callback: (err: any, result: string, blobResult: any, response: any) => void) => {
    const contractName = blob.replace(".json", "");
    if (!mockedContractNames.includes(contractName)) {
      callback(new Error(contractName + ".json is not a valid contract"), "", null, null);
    }
    callback(null, JSON.stringify({ contractName: `${contractName}` }), {} as azure.BlobService.BlobResult, null);
  })
}

const azureStub = {
  createBlobService: sinon.stub().callsFake((connString: string) => {
    if (connString == mockedConnectionString) {
      return blobServiceStub;
    }

    throw new Error("Invalid connection string");
  })
}

import { AzureBlobContractSource } from "eth-transaction-proxy";
const AzureBlobContractSourceStub = <typeof AzureBlobContractSource> proxyquire("eth-transaction-proxy/lib/contract-sources/azure-blob/AzureBlobContractSource", {
  'azure-storage': azureStub
}).AzureBlobContractSource;

export function createAzureBlobContractSource(connection: string, container: string) {
  return new AzureBlobContractSourceStub(connection, container);
}
