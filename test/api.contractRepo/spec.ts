import "mocha";
import * as assert from "assert";
import * as contractRepo from "./setup";
import { ABICache } from "eth-transaction-proxy/lib/internal/ABICache";
import { FileABIMetadata } from "eth-transaction-proxy/lib/abi-sources/folder/FileABIMetadata";
import { testBedContract, migrationContract } from "../common.setup";

const buildDirectory0 = "./build/api.folder0/";
const buildDirectory1 = "./build/api.folder1/";
const buildDirectory2 = "./build/api.folder2/";

before("Copying contract ABIs to folder locations...", () => {
  return contractRepo.setup(
    buildDirectory0,
    buildDirectory1,
    buildDirectory2
  );
});

after(() => {
  return contractRepo.teardown(
    buildDirectory1,
    buildDirectory2
  );
});

describe("ABICache", () => {
  describe("addMetadata(metadata)", () => {

    const cache = new ABICache();

    it("succeeds in the normal case", () => {
      const metadata = new FileABIMetadata("Foo", "test");
      cache.addMetadata(metadata);
      assert.equal(cache.getMap().has("Foo"), true);
    });

    it("errors when duplicates are added", () => {
      const metadata0 = new FileABIMetadata("Dup", "test");
      const metadata1 = new FileABIMetadata("Dup", "test");
      cache.addMetadata(metadata0);

      try {
        cache.addMetadata(metadata1);
      } catch (err) {
        return;
      }

      assert.fail("This should fail.");
    });

  });
  describe("addABI(abi)", () => {

    const cache = new ABICache();

    it("succeeds in the normal case", () => {
      const abi = { contractName: "Foo" };
      cache.addABI(abi);
      assert.equal(cache.getMap().has("Foo"), true);
    });

    it("errors when duplicates are added", () => {
      const abi0 = { contractName: "Dup" };
      const abi1 = { contractName: "Dup" };
      cache.addABI(abi0);

      try {
        cache.addABI(abi1);
      } catch (err) {
        return;
      }

      assert.fail("This should fail.");
    });

    it("errors when an undefined abi is passed in", () => {
      const abi = undefined;

      try {
        cache.addABI(abi);
      } catch (err) {
        return;
      }

      assert.fail("This should fail.");
    });

    it("errors when an undefined contractName is passed in", () => {
      const abi = { contractName: undefined };

      try {
        cache.addABI(abi);
      } catch (err) {
        return;
      }

      assert.fail("This should fail.");
    });

  });
  describe("tryGetABI(contractName)", () => {

    const cache = new ABICache();
    const abi = { contractName: "Foo" };
    cache.addABI(abi);

    it("succeeds in the normal case", () => {
      return cache.tryGetABI("Foo")
        .then((result) => assert.equal(result, abi))
        .catch((err: Error) => assert.fail(err.message));
    });

    it("returns nothing when it isn't found", () => {
      return cache.tryGetABI("NotFoo")
        .then((result) => assert.equal(result, undefined))
        .catch((err: Error) => assert.fail(err.message));
    });

  });
  describe("clear", () => {

    it("clears the cache", () => {
      const cache = new ABICache();
      const abi = { contractName: "Foo" };
      cache.addABI(abi);

      assert.equal(cache.getMap().size, 1);
      cache.clear();
      assert.equal(cache.getMap().size, 0);
    });

  });
});

describe("ContractRepo", () => {
  let contractRepoS0: contractRepo.TestContractRepo;
  let contractRepoS1: contractRepo.TestContractRepo;
  let contractRepoS3: contractRepo.TestContractRepo;

  describe("constructor", () => {

    it("succeeds with 0 source locations", () => {
      contractRepoS0 = new contractRepo.TestContractRepo();
      assert.equal(contractRepoS0.getSources().length, 0);
    });

    it("succeeds with 1 source location", () => {
      contractRepoS1 = new contractRepo.TestContractRepo([
        contractRepo.folderABISource0
      ]);
      assert.equal(contractRepoS1.getSources().length, 1);
    });

    it("succeeds with 3 source locations", () => {
      contractRepoS3 = new contractRepo.TestContractRepo([
        contractRepo.folderABISource0,
        contractRepo.folderABISource1,
        contractRepo.folderABISource2
      ]);
      assert.equal(contractRepoS3.getSources().length, 3);
    })

  });
  describe(".getContractABI(contractName)", () => {

    it("should fail with 0 source locations", () => {
      return contractRepoS0.getContractABI(testBedContract)
        .then((abi) => {
          assert.fail("Error: This shouldn't succeed.");
        })
        .catch((err: Error) => { });
    });

    it("should succeed with 1 source location", () => {
      return contractRepoS1.getContractABI(testBedContract)
        .then((abi) => {
          assert.equal(abi.contractName, testBedContract);
        })
        .catch((err: Error) => assert.fail(err.message));
    });

    it("should succeed with 3 source locations", () => {
      return contractRepoS3.getContractABI("TestAgain")
        .then((abi) => {
          assert.equal(abi.contractName, "TestAgain");
        })
        .catch((err: Error) => assert.fail(err.message));
    });

    it("should fail with 1 source location & a bad contractName", () => {
      return contractRepoS1.getContractABI("BadName")
        .then((abi) => {
          assert.equal(abi, undefined);
        })
        .catch((err: Error) => assert.fail(err.message));
    });

    it("should fail with 3 source locations & a bad contractName", () => {
      return contractRepoS3.getContractABI("BadName")
        .then((abi) => {
          assert.equal(abi, undefined);
        })
        .catch((err: Error) => assert.fail(err.message));
    });

  });
  describe(".cacheMetadata", () => {

    it("should fail when 0 sources are present", () => {
      return contractRepoS0.cacheMetadata()
        .then(() => {
          assert.fail("Error: This shouldn't succeed.");
        })
        .catch((err: Error) => { });
    });

    it("succeeds with 1 source present & cache is correct", () => {
      return contractRepoS1.cacheMetadata()
        .then(() => {
          const cache = contractRepoS1.getCacheInternal();
          const cacheMap = cache.getMap();
          const migrations = cacheMap.get(migrationContract);
          const testBed = cacheMap.get(testBedContract);
          assert.equal(cacheMap.size, 2);
          assert.notEqual(migrations, undefined);
          assert.notEqual(testBed, undefined);
          if (migrations) {
            assert.equal(migrations.getContractName(), migrationContract);
          }
          if (testBed) {
            assert.equal(testBed.getContractName(), testBedContract);
          }
        })
        .catch((err: Error) => {
          assert.fail(err.message);
        });
    });

    it("succeeds with 3 sources present & cache is correct", () => {
      return contractRepoS3.cacheMetadata()
        .then(() => {
          const cache = contractRepoS3.getCacheInternal();
          const cacheMap = cache.getMap();
          const migrations = cacheMap.get(migrationContract);
          const testBed = cacheMap.get(testBedContract);
          const test = cacheMap.get("Test");
          const testAgain = cacheMap.get("TestAgain");
          assert.equal(cacheMap.size, 4);
          assert.notEqual(migrations, undefined);
          assert.notEqual(testBed, undefined);
          assert.notEqual(test, undefined);
          assert.notEqual(testAgain, undefined);
          if (migrations) {
            assert.equal(migrations.getContractName(), migrationContract);
          }
          if (testBed) {
            assert.equal(testBed.getContractName(), testBedContract);
          }
          if(test) {
            assert.equal(test.getContractName(), "Test");
          }
          if (testAgain) {
            assert.equal(testAgain.getContractName(), "TestAgain");
          }
        })
        .catch((err: Error) => {
          assert.fail(err.message);
        });
    });

  });

  describe(".getContractABI(contractName) post caching", () => {

    it("should succeed with 1 source location, and cache should remain unchanged", () => {
      const cache = contractRepoS1.getCacheInternal();
      const cacheMap = cache.getMap();
      assert.equal(cacheMap.size, 2);
      return contractRepoS1.getContractABI(testBedContract)
        .then((abi) => {
          assert.equal(abi.contractName, testBedContract);
          assert.equal(cache.getMap().size, 2);
        })
        .catch((err: Error) => assert.fail(err.message));
    });

  });
});
