import "mocha";
import * as assert from "assert";
import { AzureBlobContractSource } from "eth-transaction-proxy";

const containerName = "testcontracts";
const contractName = "Migrations";
let connectionString = "";
let contractSource: AzureBlobContractSource;

// Only actually run blob tests if the environment variable is set to
if (process.env["TEST_BLOB"] == "1") {

    before("Setup blob storage connector", () => {
        let env = process.env["AZURE_STORAGE_CONNECTION_STRING"];
        if (env) {
            connectionString = env;
        } else {
            throw Error("You must setup the environment variable 'AZURE_STORAGE_CONNECTION_STRING' to connect to blob storage for this test suite.");
        }
    
        contractSource = new AzureBlobContractSource(connectionString, containerName);
    });
    
    describe("AzureBlobContractSource", () => {
        describe("constructor", () => {
    
            it("should connect to blob storage", () => {
                assert.doesNotThrow(() => {
                    new AzureBlobContractSource(connectionString, containerName);
                });
            });
    
            it("should not connect to blob storage", () => {
                const connectionString = 'abcd';
    
                assert.throws(() => {
                    new AzureBlobContractSource(connectionString, containerName);
                });
            });
    
            it("container does not exist", () => {
    
                const containerName = 'doesnotexist';
                contractSource = new AzureBlobContractSource(connectionString, containerName);
    
                return contractSource.validateConnection()
                .then((result) => {
                    assert.equal(result, false);
                })
                .catch((err: Error) => assert.fail(err.message));
            });
    
            it("container does exist", () => {
                contractSource = new AzureBlobContractSource(connectionString, containerName);
    
                return contractSource.validateConnection()
                .then((result) => {
                    assert.equal(result, true);
                })
                .catch((err: Error) => assert.fail(err.message));
            });
        });
    
        describe("list", () => {
            it("should list 2 abi metadatas", () => {
                return contractSource.list().then((metadatas) => {
                    assert.equal(metadatas.length, 2);
                });
            });
        });
    
        describe("get", () => {
            it("should get a specific ABI", () => {
                return contractSource.get(contractName).then((abi) => {
                    assert(Object.keys(abi).length > 0);
                });
            });
    
            it("should not find a specific ABI", () => {
                const contractName = "doesnotexist";
    
                let didFail = false;
                return contractSource.get(contractName).then((abi) => {
    
                }).catch((err: Error) => {
                    didFail = true;
                }).then(() => {
                    assert(didFail);
                });
            });
    
        });
    });
    
} else {
    console.log("Azure Blob Storage Source testing is disabled.");
}

