import "mocha";
import * as assert from "assert";
import { TransactionReceipt } from "web3/types";
import { Config, TestTransaction } from "./setup";

export const test = (config: Config) => {
  describe("submit(signedTransactionHex)", () => {

    let web3: any;
    let proxy: any;
    let accountAddr: string;
    let accountPriv: string;

    before("initialize helper variables...", () => {
      web3 = config.web3;
      proxy = config.proxy;
      accountAddr = config.accountAddr;
      accountPriv = config.accountPriv;
    });

    const signAndSubmitTransaction = async (transaction: any): Promise<TransactionReceipt> => {
      const nonce = await web3.eth.getTransactionCount(accountAddr);
      transaction.nonce = nonce;
      const signedTx = await web3.eth.accounts.signTransaction(transaction, accountPriv);
      return await proxy.submit(signedTx.rawTransaction);
    }

    const testTransaction = async (test: TestTransaction): Promise<void> => {
      const receipt = await signAndSubmitTransaction(test.package);
      test.receipt = receipt;
    }

    it("fails when transaction is corrupted", async () => {
      let signedTx = await web3.eth.accounts.signTransaction(config.addAddressMappingTest.package, accountPriv);
      signedTx.rawTransaction = signedTx.rawTransaction.replace("4", "2");

      let failed = false;
      try {
        await proxy.submit(signedTx.rawTransaction);
      } catch (e) {
        failed = true;
      }

      if (!failed) {
        assert.fail("This shouldn't succeed.");
      }
    });

    it("fails when signature is incorrect", async () => {
      const privateKey = accountPriv.replace("2", "A");
      const signedTx = await web3.eth.accounts.signTransaction(config.addAddressMappingTest.package, privateKey);

      let failed = false;
      try {
        await proxy.submit(signedTx.rawTransaction);
      } catch (e) {
        failed = true;
      }

      if (!failed) {
        assert.fail("This shouldn't succeed.");
      }
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
