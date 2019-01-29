import "mocha";



import * as assert from "assert";
import * as setup from "./setup";

const contractNames = setup.mockedContractNames;
const containerName = setup.mockedContainerName;
const connectionString = setup.mockedConnectionString

import { AzureBlobContractSource } from "eth-transaction-proxy";

let contractSource: AzureBlobContractSource;

describe("AzureBlobContractSource", () => {
  describe("constructor", () => {

    it("should accept valid connection string", () => {
      assert.doesNotThrow(() => {
        setup.createAzureBlobContractSource(connectionString, containerName);
      });
    });

    it("should reject invalid connection string", () => {
      const connectionString = 'abcd';

      assert.throws(() => {
        setup.createAzureBlobContractSource(connectionString, containerName);
      });
    });

    it("rejects invalid container", () => {

      const containerName = 'doesnotexist';
      contractSource = setup.createAzureBlobContractSource(connectionString, containerName);

      return contractSource.validateConnection()
      .then((result) => {
        assert.equal(result, false);
      })
      .catch((err: Error) => assert.fail(err.message));
    });

    it("accepts valid conatiner", async () => {
      contractSource = setup.createAzureBlobContractSource(connectionString, containerName);
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
    it("should retrieve a valid contract", () => {
      return contractSource.get(contractNames[0]).then((abi) => {
        assert(Object.keys(abi).length > 0);
      });
    });

    it("should fail when trying to get an invalid contract", () => {
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
