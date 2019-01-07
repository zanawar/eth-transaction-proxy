import "mocha";
import * as assert from "assert";
import * as setup from "./setup";
import { ContractRepo } from "eth-transaction-proxy";
import { ContractCache } from "eth-transaction-proxy/lib/internal/ContractCache"; 

export class TestContractRepo extends ContractRepo {
  public getCacheInternal(): ContractCache {
    return this.cache;
  }
}

before("Setting up contract sources for test...", () => {
  setup.createSources();
});

describe("ContractRepo", () => {
  let contractRepoS0: ContractRepo;
  let contractRepoS1: ContractRepo;
  let contractRepoAll : ContractRepo;

  before(() => {
    contractRepoS0 = new ContractRepo();
    contractRepoS1 = new ContractRepo([
      setup.ContractSources[0]
    ]);
    contractRepoAll = new ContractRepo(setup.ContractSources);
  });

  describe("constructor", () => {
    let contractRepoS3: ContractRepo;

    it("succeeds with 0 source locations", () => {
      assert.equal(contractRepoS0.getSources().length, 0);
    });

    it("succeeds with 1 source location", () => {
      assert.equal(contractRepoS1.getSources().length, 1);
    });

    it("succeeds with 3 source locations", () => {
      contractRepoS3 = new ContractRepo([
        setup.ContractSources[0],
        setup.ContractSources[1],
        setup.ContractSources[2]
      ]);
      assert.equal(contractRepoS3.getSources().length, 3);
    });
  });

  describe(".getContractABI(contractName)", () => {

    it("should fail with 0 source locations", () => {
      return contractRepoS0.getContractABI(setup.AllContractNames[0])
        .then((abi) => {
          assert.fail("Error: This shouldn't succeed.");
        })
        .catch((err: Error) => { });
    });

    it("should succeed with 1 source location", () => {
      return contractRepoS1.getContractABI(setup.AllContractNames[0])
        .then((abi) => {
          assert.equal(abi.contractName, setup.AllContractNames[0]);
        })
        .catch((err: Error) => assert.fail(err.message));
    });

    it("should succeed with multiple source locations", () => {
      let contractName = setup.AllContractNames[setup.AllContractNames.length - 1];
      return contractRepoAll.getContractABI(contractName)
        .then((abi) => {
          assert.equal(abi.contractName, contractName);
        })
        .catch((err: Error) => assert.fail(err.message));
    });

    it("should fail with a contract that doesn't exist", async () => {
      let badContract = await contractRepoAll.getContractABI("BadName");
      assert.equal(badContract, undefined);
    });
  });

  describe(".precache()", () => {
    let contractRepoMultiple : TestContractRepo;

    before(() => {
      contractRepoMultiple = new TestContractRepo(setup.ContractSources);
    });

    it("should fail when 0 sources are present", async () => {
      try {
        await contractRepoS0.precache();
      } catch {
        return;
      }

      assert.fail("Error: This shouldn't succeed.");
    });

    it("should cache all contracts from a single source", async () => {
      let contractRepoSingle = new TestContractRepo([setup.ContractSources[0]]);

      await contractRepoSingle.precache();
      const cache = contractRepoSingle.getCacheInternal();
      const cacheMap = cache.getMap();

      assert.equal(cacheMap.size, setup.ContractNames[0].length);

      const contract = cache.get(setup.ContractNames[0][0]);
      assert.equal(contract.name(), setup.ContractNames[0][0])
    });

    it("should cache all contracts from multiple sources", async () => {
      await contractRepoMultiple.precache();
      const cache = contractRepoMultiple.getCacheInternal();
      const cacheMap = cache.getMap();

      assert.equal(cacheMap.size, setup.AllContractNames.length);

      for (let contractName of setup.AllContractNames) {
        cache.get(contractName);
      }
    });

  });
});
