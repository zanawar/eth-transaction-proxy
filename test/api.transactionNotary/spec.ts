import "mocha";
import * as assert from "assert";
import * as setup from "./setup";
import { Config } from "./setup";
import * as create from "./create";
import * as submit from "./submit";
import * as view from "./view";
import { TransactionNotary } from "eth-transaction-proxy";

let config = new Config();

before("Build contracts, standup network, setup contractRepo...", () => {
  return setup.setup(config);
});

describe("TransactionNotary", () => {

  describe("constructor", () => {

    let contractRepo: any;
    let web3: any;

    before("intialize helper variables...", () => {
      contractRepo = config.contractRepo;
      web3 = config.web3;
    });

    it("succeeds in the normal case", () => {
      return new Promise((resolve, reject) => {
        config.notary = new TransactionNotary(contractRepo, "", web3, (result: Promise<boolean>) => {
          result.then((success) => {
            if (!success) {
              assert.fail("Error: Failed to connect.");
            }
            resolve();
          })
          .catch((err) => {
            reject(err);
          });
        });
      });
    });

    it("fails when the network string is invalid", () => {
      return new Promise((resolve, reject) => {
        new TransactionNotary(contractRepo, "foo", undefined, (result: Promise<boolean>) => {
          result.then((success) => {
            if (success) {
              reject();
            }
          })
          .catch((err) => {
            resolve();
          });
        });
      });
    });
  });

  create.test(config);

  submit.test(config);

  view.test(config);

});
