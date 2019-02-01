import "mocha";
import * as assert from "assert";
import { Config, TestTransaction, ContractData } from "./setup";
import { testBedContract } from "../common.setup";

export const test = (config: Config) => {
  describe("create(from, contractName, method, argumentPayload)", () => {

    const extraGas = 1000;

    let web3: any;
    let proxy: any;
    let accountAddr: string;
    let contractAddress: string;

    before("intialize helper variables...", () => {
      web3 = config.web3;
      proxy = config.proxy;
      accountAddr = config.accountAddr;
      contractAddress = config.contractAddress;
    });

    const verifyTransactionPackage = async (transactionPackage: any, signature: any, inputs: any[], isConstructor: boolean, contractData: ContractData): Promise<any> => {
      assert.equal(transactionPackage.from, accountAddr);
      if (!isConstructor) {
        assert.equal(transactionPackage.to, contractAddress);
      }
      

      const nonce = await web3.eth.getTransactionCount(accountAddr);
      assert.equal(transactionPackage.nonce, nonce);

      const gasPrice = await web3.eth.getGasPrice();
      assert.equal(transactionPackage.gasPrice, gasPrice);

      let data: any;
      if (isConstructor) {
        const contract = new web3.eth.Contract(contractData.abi);
        const deployObject = contract.deploy({
          data: contractData.bytecode,
          arguments: inputs
        });
        data = deployObject.encodeABI();
      } else {
        data = await web3.eth.abi.encodeFunctionCall(signature, inputs);
      }
      assert.equal(transactionPackage.data, data);
      

      const tx = {
        from: accountAddr,
        to: isConstructor ? null : contractAddress,
        data: data
      };
      const gasLimit = await web3.eth.estimateGas(tx);

      if (transactionPackage.gasLimit > gasLimit) {
        assert.equal(transactionPackage.gasLimit, gasLimit + extraGas);
      } else {
        assert.equal(transactionPackage.gasLimit, gasLimit);
      }

      return transactionPackage;
    }

    const runTest = async (testDefinition: any, results: TestTransaction) => {
      const isConstructor = testDefinition.transaction.method === "constructor";
      const transactionPackage = await proxy.create(testDefinition.transaction);
      const signature = testDefinition.signature;
      const inputs = testDefinition.inputs;
      const contractData = config.contractData;

      await verifyTransactionPackage(transactionPackage, signature, inputs, isConstructor, contractData);

      results.package = transactionPackage;
    }

    const defineCreateTest = (testName: string) => {
      const testResult = config.transactionResults.get(testName);
      const testDefinition = config.getTestMethod(testName);

      if (testResult == null) {
        throw Error("No matching test result for test '" + testName + "'");
      }
      const shouldFail = testDefinition.fails || false;

      let testDescription = testDefinition.transaction.method + "(";
      if (testDefinition.signature == null || testDefinition.output != "") {
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
      testDescription += ") transaction " + (shouldFail ? "fails " : "creates successfully ");

      if (testDefinition.desc) {
        testDescription += "when " + testDefinition.desc;
      }

      testDescription += " [Test: " + testName + "]";

      it(testDescription, async() => {
        let failed = false;
        let failReason: any;
        let liveTestDefinition = config.getTestMethod(testName);

        try {
          await runTest(liveTestDefinition, testResult);
        } catch (e) {
          failed = true;
          failReason = e;
        }

        if (shouldFail && !failed) {
          assert.fail("Should have failed.");
        } else if (!shouldFail && failed) {
          throw failReason;
        }
        
      });
    }

    Object.keys(config.testMethods).forEach(key => {
      defineCreateTest(key);
    });

    it("testOverload(value, other) transaction created successfully", async () => {
      let failed = false;
      try {
        await proxy.create({
          from: accountAddr,
          to: contractAddress,
          contractName: testBedContract,
          method: "testOverload",
          arguments: {
            value: 8,
            other: 9
          }
        })
      }
      catch (e) {
        failed = true;
      }

      if (!failed) {
        assert.fail("Error: This shouldn't succeed");
      }
    });

    it("fails when creating a transaction for a 'view' method", async () => {
      let failed = false;
      try {
        await proxy.create({
          from: accountAddr,
          to: contractAddress,
          contractName: testBedContract,
          method: "getAddressMappingString",
          arguments: {
            addr: accountAddr
          }
        });
      }
      catch (e) {
        failed = true;
      }

      if (!failed) {
        assert.fail("Error: This shouldn't succeed");
      }
    });

  });
}
