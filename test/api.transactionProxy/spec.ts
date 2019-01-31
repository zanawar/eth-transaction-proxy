import "mocha";
import * as assert from "assert";
import * as setup from "./setup";
import { Config } from "./setup";
import * as create from "./create";
import * as submit from "./submit";
import * as view from "./view";
import { TransactionProxy } from "eth-transaction-proxy";

let config = new Config();

before("Build contracts, standup network, setup contractRepo...", () => {
  return setup.setup(config);
});

describe("TransactionProxy", () => {

  describe("constructor", () => {

    let contractRepo: any;
    let web3: any;

    before("intialize helper variables...", () => {
      contractRepo = config.contractRepo;
      web3 = config.web3;
    });

    it("Can be constructed with a web3 instance", () => {
      return new Promise(async (resolve, reject) => {
        config.proxy = new TransactionProxy(contractRepo, undefined, web3);
        let connected = await config.proxy.testConnection()
        if (!connected) {
          reject();
          return;
        }

        resolve();
      });
    });

    it("Can be constructed with just an RPC endpoint", async () => {
      new TransactionProxy(undefined, "foo");
    });
  });

  describe("testConnection", () => {

    let web3: any;

    before("intialize helper variables...", () => {
      web3 = config.web3;
    });

    it("fails when the rpc endpoint is invalid", async () => {
      let proxy = new TransactionProxy(undefined, "foo", undefined);
      if (await proxy.testConnection()) {
        assert.fail("Should have failed!");
      }
    });

    it("succeeds when the rpc endpoint is valid", async () => {
      let proxy = new TransactionProxy(undefined, undefined, web3);
      if (!await proxy.testConnection()) {
        assert.fail("Should have passed!");
      }
    });

  })

  create.test(config);

  submit.test(config);

  view.test(config);

});
