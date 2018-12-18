import "mocha";
import * as assert from "assert";
import { TransactionReceipt } from "web3/types";
import { Config, TestTransaction } from "./setup";

export const test = (config: Config) => {
  describe("submitTransaction(signedTransactionHex)", () => {

    let web3: any;
    let notary: any;
    let accountAddr: string;
    let accountPriv: string;

    before("initialize helper variables...", () => {
      web3 = config.web3;
      notary = config.notary;
      accountAddr = config.accountAddr;
      accountPriv = config.accountPriv;
    });

    const signAndSubmitTransaction = (transaction: any): Promise<TransactionReceipt> => {
      return new Promise<TransactionReceipt>((resolve, reject) => {
        // get the nonce once more
        web3.eth.getTransactionCount(accountAddr)
          .then((txCount: number) => {
            transaction.nonce = txCount;
            return web3.eth.accounts.signTransaction(transaction, accountPriv);
          })
          .then((signedTx: any) => {
            resolve(notary.submitTransaction(signedTx.rawTransaction));
          })
          .catch(reject);
      });
    }

    const testTransaction = (test: TestTransaction): Promise<void> => {
      return new Promise((resolve, reject) => {
        signAndSubmitTransaction(test.package)
          .then((transactionReceipt: TransactionReceipt) => {
            test.receipt = transactionReceipt;
            resolve();
          })
          .catch(reject);
      })
    }

    it("fails when transaction is corrupted", () => {
      return new Promise((resolve, reject) => {
        web3.eth.accounts.signTransaction(config.addAddressMappingTest.package, accountPriv)
          .then((signedTx: any) => {
            signedTx.rawTransaction = signedTx.rawTransaction.replace("4", "2");
            return notary.submitTransaction(signedTx.rawTransaction);
          })
          .then((transactionReceipt: TransactionReceipt) => {
            assert.fail("Error: This shouldn't succeed.");
          })
          .catch((err: Error) => resolve());
      });
    });

    it("fails when signature is incorrect", () => {
      return new Promise((resolve, reject) => {
        const privateKey = accountPriv.replace("2", "A");
        web3.eth.accounts.signTransaction(config.addAddressMappingTest.package, privateKey)
          .then((signedTx: any) => {
            return notary.submitTransaction(signedTx.rawTransaction);
          })
          .then((transactionReceipt: TransactionReceipt) => {
            assert.fail("Error: This shouldn't succeed.");
          })
          .catch((err: Error) => resolve());
      });
    });

    it("successfully submits the addAddressMapping(addr, str) transaction", () => {
      return testTransaction(config.addAddressMappingTest);
    });

    it("successfully submits the updateStructText(sometext) transaction", () => {
      return testTransaction(config.updateStructureTextTest);
    });

    it("successfully submits the modifyBool(value) transaction", () => {
      return testTransaction(config.modifyBoolTest);
    });

    it("successfully submits the modifyint8(value) transaction", () => {
      return testTransaction(config.modifyint8Test);
    });

    it("successfully submits the modifyint256(value) transaction", () => {
      return testTransaction(config.modifyint256Test);
    });

    it("successfully submits the modifyuint8(value) transaction", () => {
      return testTransaction(config.modifyuint8Test);
    });

    it("successfully submits the modifyuint256(value) transaction", () => {
      return testTransaction(config.modifyuint256Test);
    });

    it("successfully submits the modifybytes1(value) transaction", () => {
      return testTransaction(config.modifybytes1Test);
    });

    it("successfully submits the modifybytes32(value) transaction", () => {
      return testTransaction(config.modifybytes32Test);
    });

    it("successfully submits the modifybytes(value) transaction", () => {
      return testTransaction(config.modifybytesTest);
    });

    it("successfully submits the testSpawnEventUint(value) transaction", () => {
      return testTransaction(config.testSpawnEventUintTest);
    });

    it("successfully submits the testSpawnEventWithAddress() transaction", () => {
      return testTransaction(config.testSpawnEventWithAddressTest);
    });

  });
}
