import "mocha";
import * as assert from "assert";
import {assertThrowsAsync} from "../helpers/asyncthrow";
import * as setup from "./setup";
import { ContractRepository } from "eth-transaction-proxy";
import { ContractCache } from "eth-transaction-proxy/lib/internal/ContractCache"; 

export class TestContractRepository extends ContractRepository {
  public getCacheInternal(): ContractCache {
    return this.cache;
  }
}

before("Setting up contract sources for test...", () => {
  setup.createSources();
});

describe("ContractRepository", () => {
  let contractRepoS0: ContractRepository;
  let contractRepoS1: ContractRepository;
  let contractRepoAll : ContractRepository;

  before(() => {
    contractRepoS0 = new ContractRepository();
    contractRepoS1 = new ContractRepository([
      setup.ContractSources[0]
    ]);
    contractRepoAll = new ContractRepository(setup.ContractSources);
  });

  describe("constructor", () => {
    let contractRepoS3: ContractRepository;

    it("succeeds with 0 source locations", () => {
      assert.equal(contractRepoS0.getSources().length, 0);
    });

    it("succeeds with 1 source location", () => {
      assert.equal(contractRepoS1.getSources().length, 1);
    });

    it("succeeds with 3 source locations", () => {
      contractRepoS3 = new ContractRepository([
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
      await assertThrowsAsync(
        async() => await contractRepoAll.getContractABI("BadName"),
        "Should have failed");
    });
  });

  describe(".precache()", () => {
    let contractRepoMultiple : TestContractRepository;

    before(() => {
      contractRepoMultiple = new TestContractRepository(setup.ContractSources);
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
      let contractRepoSingle = new TestContractRepository([setup.ContractSources[0]]);

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
