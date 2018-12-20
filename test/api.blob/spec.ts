import "mocha";
import * as assert from "assert";
import { AzureBlobContractSource } from "eth-transaction-proxy";

const containerName = "testcontracts";
const contractName = "Migrations";
let connectionString = "";
let AzureBlobContractSource: AzureBlobContractSource;

before("Setup blob storage connector", () => {
    let env = process.env["TESTING_BLOB_STORAGE"];
    if (env) {
        connectionString = env;
    } else {
        throw Error("You must setup the environment variable 'TESTING_BLOB_STORAGE' to connect to blob storage for this test suite.");
    }

    AzureBlobContractSource = new AzureBlobContractSource(connectionString, containerName);
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
            AzureBlobContractSource = new AzureBlobContractSource(connectionString, containerName);

            return AzureBlobContractSource.validateConnection()
            .then((result) => {
                assert.equal(result, false);
            })
            .catch((err: Error) => assert.fail(err.message));
        });

        it("container does exist", () => {
            AzureBlobContractSource = new AzureBlobContractSource(connectionString, containerName);

            return AzureBlobContractSource.validateConnection()
            .then((result) => {
                assert.equal(result, true);
            })
            .catch((err: Error) => assert.fail(err.message));
        });
    });

    describe("list", () => {
        it("should list 2 abi metadatas", () => {
            return AzureBlobContractSource.list().then((metadatas) => {
                assert.equal(metadatas.length, 2);
            });
        });
    });

    describe("get", () => {
        it("should get a specific ABI", () => {
            return AzureBlobContractSource.get(contractName).then((abi) => {
                assert(Object.keys(abi).length > 0);
            });
        });

        it("should not find a specific ABI", () => {
            const contractName = "doesnotexist";

            let didFail = false;
            return AzureBlobContractSource.get(contractName).then((abi) => {

            }).catch((err: Error) => {
                didFail = true;
            }).then(() => {
                assert(didFail);
            });
        });

    });
});
