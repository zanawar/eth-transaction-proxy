import "mocha";
import * as assert from "assert";
import { MethodTests } from "./methodTests";
import { Config, TestTransaction, ContractData } from "./setup";
import { testBedContract } from "../common.setup";

export const test = (config: Config) => {
  describe("create(from, contractName, method, argumentPayload)", () => {

    const extraGas = 1000;

    let web3: any;
    let proxy: any;
    let accountAddr: string;
    let contractAddress: string;
    let methodTests: any;

    before("intialize helper variables...", () => {
      web3 = config.web3;
      proxy = config.proxy;
      accountAddr = config.accountAddr;
      contractAddress = config.contractAddress;
      methodTests = MethodTests(config);
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

    it("constructor() transaction fails when passing in a 'to' address.", async () => {
      let failed = false;
      try {
        await runTest(methodTests.constructorWithTo, config.constructorTest);
      } catch {
        failed = true;
      }

      if (!failed) {
        assert.fail("Should have failed");
      }
      
    });
    
    it("constructor() transaction created successfully", () => {
      return runTest(methodTests.constructor, config.constructorTest);
    });

    it("addAddressMapping(addr, str) transaction created successfully", () => {
      return runTest(methodTests.addAddressMapping, config.addAddressMappingTest);
    });

    it("updateStructText(context) transaction created successfully", () => {
      return runTest(methodTests.updateStructText, config.updateStructureTextTest);
    });

    it("modifyBool() transaction created successfully", () => {
      return runTest(methodTests.modifyBool, config.modifyBoolTest);
    });

    it("modifyint8(value) transaction created successfully", () => {
      return runTest(methodTests.modifyint8, config.modifyint8Test);
    });

    it("modifyint256(value) transaction created successfully", () => {
      return runTest(methodTests.modifyint256, config.modifyint256Test);
    });

    it("modifyuint8(value) transaction created successfully", () => {
      return runTest(methodTests.modifyuint8, config.modifyuint8Test);
    });

    it("modifyuint256(value) transaction created successfully", () => {
      return runTest(methodTests.modifyuint256, config.modifyuint256Test);
    });

    it("modifybytes1(value) transaction created successfully", () => {
      return runTest(methodTests.modifybytes1, config.modifybytes1Test);
    });

    it("modifybytes32(value) transaction created successfully", () => {
      return runTest(methodTests.modifybytes32, config.modifybytes32Test);
    });

    it("modifybytes(value) transaction created successfully", () => {
      return runTest(methodTests.modifybytes, config.modifybytesTest);
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

    it("testSpawnEventUint(value) transaction created successfully", () => {
      return runTest(methodTests.testSpawnEventUint, config.testSpawnEventUintTest);
    });

    it("testSpawnEventWithAddress() transaction created successfully", () => {
      return runTest(methodTests.testSpawnEventWithAddress, config.testSpawnEventWithAddressTest);
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
