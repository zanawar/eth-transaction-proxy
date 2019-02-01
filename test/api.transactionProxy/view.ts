import "mocha";
import * as assert from "assert";
import { Config } from "./setup";
import { MethodTests } from "./methodTests";
import { IViewConfig} from "eth-transaction-proxy/lib/interfaces/IViewConfig";

export const test = (config: Config) => {
  describe("view(config)", () => {

    let proxy: any;
    let methodTests: any;

    before("initialize helper variables...", () => {
      proxy = config.proxy;
      methodTests = MethodTests(config);
    });

    const verifyView = async (methodTest: any): Promise<any> => {
      let transaction = methodTest.transaction;
      let expected = methodTest.output;
      
      // Setup IViewConfig
      let viewConfig: IViewConfig = {
        to: transaction.to,
        from: transaction.from,
        contractName: transaction.contractName,
        method: transaction.method,
        arguments: transaction.arguments
      };

      let result = await proxy.view(viewConfig);
      assert.equal(expected, result);
    }

    it("verifies the getMappedBool(value) transaction completed correctly", () => {
      verifyView(methodTests.getMappedBool);
    });

    it("verifies the getBool() transaction completed correctly", () => {
      verifyView(methodTests.getBool);
    });

    it("verifies the getint8() transaction completed correctly", () => {
      verifyView(methodTests.getint8);
    });

    it("verifies the getint256(value) transaction completed correctly", () => {
      verifyView(methodTests.getint256);
    });

    it("verifies the getuint8() transaction completed correctly", () => {
      verifyView(methodTests.getuint8);
    });

    it("verifies the getuint256() transaction completed correctly", () => {
      verifyView(methodTests.getuint256);
    });

    it("verifies the getbytes1() transaction completed correctly", () => {
      verifyView(methodTests.getbytes1);
    });

    it("verifies the getbytes32() transaction completed correctly", () => {
      verifyView(methodTests.getbytes32);
    });

    it("verifies the getRandomBytes() transaction completed correctly", () => {
      verifyView(methodTests.getRandomBytes);
    });

    it("verifies the getArbitraryAddressBalance(addr) transaction completed correctly", () => {
      verifyView(methodTests.getArbitraryAddressBalance);
    });

    it("verifies the getSenderAddressBalance() transaction completed correctly", () => {
      verifyView(methodTests.getSenderAddressBalance);
    });
  });
}