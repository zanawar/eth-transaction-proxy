import "mocha";
import * as assert from "assert";
import * as setup from "./setup";
import { Config } from "./setup";
import * as create from "./create";
import * as submit from "./submit";
import * as view from "./view";
import { TransactionProxy, IProxyConfig } from "eth-transaction-proxy";

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
        let proxyConfig = {
          sources: contractRepo.getSources(),
          web3: web3
        } as IProxyConfig;
        config.proxy = new TransactionProxy(proxyConfig);
        let connected = await config.proxy.testConnection()
        if (!connected) {
          reject();
          return;
        }

        resolve();
      });
    });

    it("Can be constructed with just an RPC endpoint", async () => {
      new TransactionProxy({
        rpcUrl: "foo"
      } as IProxyConfig);
    });
  });

  describe("testConnection", () => {

    let web3: any;

    before("intialize helper variables...", () => {
      web3 = config.web3;
    });

    it("fails when the rpc endpoint is invalid", async () => {
      let proxy = new TransactionProxy({
        rpcUrl: "foo"
      } as IProxyConfig);
      if (await proxy.testConnection()) {
        assert.fail("Should have failed!");
      }
    });

    it("succeeds with a valid web3 instance", async () => {
      let proxy = new TransactionProxy({
        web3: web3
      } as IProxyConfig);
      if (!await proxy.testConnection()) {
        assert.fail("Should have passed!");
      }
    });

  })

  create.test(config);

  submit.test(config);

  view.test(config);

});
