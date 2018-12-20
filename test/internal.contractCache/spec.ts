import "mocha";
import * as assert from "assert";
import { FileContract } from "eth-transaction-proxy/lib/contract-sources/filesystem/FileContract";
import { ContractCache } from "eth-transaction-proxy/lib/internal/ContractCache";

describe("ContractCache", () => {

  describe("add(contract)", () => {

    const cache = new ContractCache();

    it("succeeds in the normal case", () => {
      const metadata = new FileContract("Foo", "test");
      cache.add(metadata);
      assert.equal(cache.getMap().has("Foo"), true);
    });

    it("errors when duplicates are added", () => {
      const metadata0 = new FileContract("Dup", "test");
      const metadata1 = new FileContract("Dup", "test");
      cache.add(metadata0);

      try {
        cache.add(metadata1);
      } catch (err) {
        return;
      }

      assert.fail("This should fail.");
    });
  });

  describe("get(contractName)", () => {
    const cache = new ContractCache();

    const metadata = new FileContract("Foo", "test");
    cache.add(metadata);

    it("returns contract if it exists", () => {
      cache.get("Foo");
    });

    it("throws exception if contract can't be found", () => {
      try {
        cache.get("NotFoo");
      } catch (err) {
        return;
      }

      assert.fail("This should fail.");
    });
  });

  describe("exists(contractName)", () => {
    const cache = new ContractCache();

    const metadata = new FileContract("Foo", "test");
    cache.add(metadata);

    it("returns true if contract exists", () => {
      assert.equal(cache.exists("Foo"), true, "Should be true.");
    });

    it("returns false if contract doesn't exist.", () => {
      assert.equal(cache.exists("NotFoo"), false, "Shouldn't return true.");
    });
  });
});
