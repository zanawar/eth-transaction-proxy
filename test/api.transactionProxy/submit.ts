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
      let result = config.transactionResults.get("modifyuint8");
      if (result == null) {
        throw Error("Couldn't find package from modifyuint8");
      }

      let signedTx = await web3.eth.accounts.signTransaction(result.package, accountPriv);
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
      let result = config.transactionResults.get("modifyuint8");
      if (result == null) {
        throw Error("Couldn't find package from modifyuint8");
      }

      const privateKey = accountPriv.replace("2", "A");
      const signedTx = await web3.eth.accounts.signTransaction(result.package, privateKey);

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

    const defineSubmitTest = (testName: string) => {
      const testResult = config.transactionResults.get(testName);
      const testDefinition = config.getTestMethod(testName);

      if (testResult == null) {
        throw Error("No matching test result for test '" + testName + "'");
      }
      const shouldFail = testDefinition.fails || false;

      let testDescription = testDefinition.transaction.method + "(";
      if (testDefinition.signature == null || testDefinition.output != "" || shouldFail) {
        return; // view
      }

      const methodInputs = testDefinition.signature.inputs;
      if (methodInputs.length > 0) {
        for (let i = 0; i < methodInputs.length; i++) {
          testDescription += methodInputs[i].type
          if (i + 1 != methodInputs.length) {
            testDescription += ", ";
          }
        }
      }
      testDescription += ") transaction payload successfully submitted.";

      testDescription += " [Test: " + testName + "]";

      it(testDescription, async() => {
        await testTransaction(testResult);
      });
    }

    Object.keys(config.testMethods).forEach(key => {
      defineSubmitTest(key);
    });
  });
}
