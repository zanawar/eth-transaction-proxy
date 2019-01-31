import "mocha";
import * as assert from "assert";
import { MethodTests } from "./methodTests";
import { Config, TestTransaction } from "./setup";
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

    const verifyTransactionPackage = (transactionPackage: any, signature: any, inputs: any[]): Promise<any> => {
      return new Promise((resolve, reject) => {
        assert.equal(transactionPackage.from, accountAddr);
        assert.equal(transactionPackage.to, contractAddress);

        return web3.eth.getTransactionCount(accountAddr)
        .then((nonce: number) => {
          assert.equal(transactionPackage.nonce, nonce);
          return web3.eth.getGasPrice();
        })
        .then((gasPrice: string) => {
          assert.equal(transactionPackage.gasPrice, gasPrice);
          return web3.eth.abi.encodeFunctionCall(signature, inputs);
        })
        .then((data: string) => {
          assert.equal(transactionPackage.data, data);

          const tx = {
            from: accountAddr,
            to: contractAddress,
            data: data
          };
          return web3.eth.estimateGas(tx);
        })
        .then((gasLimit: number) => {
          if (transactionPackage.gasLimit > gasLimit) {
            assert.equal(transactionPackage.gasLimit, gasLimit + extraGas);
          } else {
            assert.equal(transactionPackage.gasLimit, gasLimit);
          }

          resolve(transactionPackage);
        })
        .catch(reject);
      });
    }

    const runTest = (methodTests: any, test: TestTransaction) => {
      return new Promise((resolve, reject) => {
        proxy.create(methodTests.transaction)
        .then((transactionPackage: any) => {
          const signature = methodTests.signature;
          const inputs = methodTests.inputs;
          return verifyTransactionPackage(transactionPackage, signature, inputs);
        })
        .then((transactionPackage: any) => {
          test.package = transactionPackage;
          resolve();
        })
        .catch(reject);
      });
    }

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

   it("testOverload(value, other) transaction created successfully", () => {
       return new Promise((resolve, reject) => {
        proxy.create({
          from: accountAddr,
          to: contractAddress,
          contractName: testBedContract,
          method: "testOverload",
          arguments: {
            value: 8,
            other: 9
          }
        })
        .then((transactionPackage: any) => {
          assert.fail("Error: This shouldn't succeed");
        })
        .catch((err: Error) => resolve());
      });
    });

    it("testSpawnEventUint(value) transaction created successfully", () => {
      return runTest(methodTests.testSpawnEventUint, config.testSpawnEventUintTest);
    });

    it("testSpawnEventWithAddress() transaction created successfully", () => {
      return runTest(methodTests.testSpawnEventWithAddress, config.testSpawnEventWithAddressTest);
    });

    it("fails when creating a transaction for a 'view' method", () => {
      return new Promise((resolve, reject) => {
        proxy.create({
          from: accountAddr,
          to: contractAddress,
          contractName: testBedContract,
          method: "getAddressMappingString",
          arguments: {
            addr: accountAddr
          }
        })
        .then((transactionPackage: any) => {
          assert.fail("Error: This shouldn't succeed");
        })
        .catch((err: Error) => resolve());
      });
    });
  });
}
