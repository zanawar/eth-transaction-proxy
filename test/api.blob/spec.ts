import "mocha";
import * as assert from "assert";
import { BlobABISource } from "eth-transaction-proxy";

const containerName = "testcontracts";
const contractName = "Migrations";
let connectionString = "";
let blobABISource: BlobABISource;

before("Setup blob storage connector", () => {
    let env = process.env["TESTING_BLOB_STORAGE"];
    if (env) {
        connectionString = env;
    } else {
        throw Error("You must setup the environment variable 'TESTING_BLOB_STORAGE' to connect to blob storage for this test suite.");
    }

    blobABISource = new BlobABISource(connectionString, containerName);
});

describe("BlobABISource", () => {
    describe("constructor", () => {

        it("should connect to blob storage", () => {
            assert.doesNotThrow(() => {
                new BlobABISource(connectionString, containerName);
            });
        });

        it("should not connect to blob storage", () => {
            const connectionString = 'abcd';

            assert.throws(() => {
                new BlobABISource(connectionString, containerName);
            });
        });

        it("container does not exist", () => {

            const containerName = 'doesnotexist';
            blobABISource = new BlobABISource(connectionString, containerName);

            return blobABISource.validateConnection()
            .then((result) => {
                assert.equal(result, false);
            })
            .catch((err: Error) => assert.fail(err.message));
        });

        it("container does exist", () => {
            blobABISource = new BlobABISource(connectionString, containerName);

            return blobABISource.validateConnection()
            .then((result) => {
                assert.equal(result, true);
            })
            .catch((err: Error) => assert.fail(err.message));
        });
    });

    describe("functions", () => {
        it("should get 2 abi metadatas", () => {
            return blobABISource.getABIMetadatas().then((metadatas) => {
                assert.equal(metadatas.length, 2);
            });
        });

        it("should get 2 abi contracts", () => {
            return blobABISource.getABIs().then((abis) => {
                assert.equal(abis.length, 2);
            });
        });

        it("should get a specific ABI", () => {
            return blobABISource.getABI(contractName).then((abi) => {
                assert(Object.keys(abi).length > 0);
            });
        });

        it("should not find a specific ABI", () => {
            const contractName = "doesnotexist";

            let didFail = false;
            return blobABISource.getABI(contractName).then((abi) => {

            }).catch((err: Error) => {
                didFail = true;
            }).then(() => {
                assert(didFail);
            });
        });

    });
});
