import "mocha";
import * as assert from "assert";
import * as contractRepo from "./setup";
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
        contractRepo.FolderContractSource0
      ]);
      assert.equal(contractRepoS1.getSources().length, 1);
    });

    it("succeeds with 3 source locations", () => {
      contractRepoS3 = new contractRepo.TestContractRepo([
        contractRepo.FolderContractSource0,
        contractRepo.FolderContractSource1,
        contractRepo.FolderContractSource2
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
  describe(".precache()", () => {

    it("should fail when 0 sources are present", () => {
      return contractRepoS0.precache()
        .then(() => {
          assert.fail("Error: This shouldn't succeed.");
        })
        .catch((err: Error) => { });
    });

    it("succeeds with 1 source present & cache is correct", () => {
      return contractRepoS1.precache()
        .then(() => {
          const cache = contractRepoS1.getCacheInternal();
          const cacheMap = cache.getMap();
          const migrations = cacheMap.get(migrationContract);
          const testBed = cacheMap.get(testBedContract);
          assert.equal(cacheMap.size, 2);
          assert.notEqual(migrations, undefined);
          assert.notEqual(testBed, undefined);
          if (migrations) {
            assert.equal(migrations.name(), migrationContract);
          }
          if (testBed) {
            assert.equal(testBed.name(), testBedContract);
          }
        })
        .catch((err: Error) => {
          assert.fail(err.message);
        });
    });

    it("succeeds with multiple sources present & cache is correct", () => {
      return contractRepoS3.precache()
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
            assert.equal(migrations.name(), migrationContract);
          }
          if (testBed) {
            assert.equal(testBed.name(), testBedContract);
          }
          if(test) {
            assert.equal(test.name(), "Test");
          }
          if (testAgain) {
            assert.equal(testAgain.name(), "TestAgain");
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
