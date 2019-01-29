import "mocha";
import * as assert from "assert";
import { AzureBlobContractSource } from "eth-transaction-proxy";
import * as setup from "./setup";

const containerName = "testcontracts";
const contractName = setup.contractName1;
let connectionString = "";
let contractSource: AzureBlobContractSource;

// Only actually run blob tests if the environment variable is set to
if (process.env["TEST_BLOB"] == "1") {

    before("Setup blob storage connector", async () => {
        let env = process.env["AZURE_STORAGE_CONNECTION_STRING"];
        if (env) {
            connectionString = env;
        } else {
            throw Error("You must setup the environment variable 'AZURE_STORAGE_CONNECTION_STRING' to connect to blob storage for this test suite.");
        }
    
        contractSource = new AzureBlobContractSource(connectionString, containerName);
        await setup.prepareBlobStorage(connectionString, containerName);
    });
    
    describe("AzureBlobContractSource", () => {
        describe("constructor", () => {
    
            it("should accept valid connection string", () => {
                assert.doesNotThrow(() => {
                    new AzureBlobContractSource(connectionString, containerName);
                });
            });
    
            it("should reject invalid connection string", () => {
                const connectionString = 'abcd';
    
                assert.throws(() => {
                    new AzureBlobContractSource(connectionString, containerName);
                });
            });
    
            it("rejects invalid container", () => {
    
                const containerName = 'doesnotexist';
                contractSource = new AzureBlobContractSource(connectionString, containerName);
    
                return contractSource.validateConnection()
                .then((result) => {
                    assert.equal(result, false);
                })
                .catch((err: Error) => assert.fail(err.message));
            });
    
            it("accepts valid conatiner", async () => {
              contractSource = new AzureBlobContractSource(connectionString, containerName);
  
              assert.equal(await contractSource.validateConnection(), true);
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

