import "mocha";
import * as assert from "assert";
import { Config } from "./setup";
import { IViewConfig} from "eth-transaction-proxy/lib/interfaces/IViewConfig";

export const test = (config: Config) => {
  describe("view(config)", () => {

    let proxy: any;

    before("initialize helper variables...", () => {
      proxy = config.proxy;
    });

    const verifyView = async (methodTest: any): Promise<any> => {
      let transaction = methodTest.transaction;
      let expected = "\"" + methodTest.output + "\"";
      
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

    const defineViewTest = (testName: string) => {
      const testResult = config.transactionResults.get(testName);
      const testDefinition = config.getTestMethod(testName);

      if (testResult == null) {
        throw Error("No matching test result for test '" + testName + "'");
      }
      const shouldFail = testDefinition.fails || false;

      let testDescription = testDefinition.transaction.method + "(";
      if (testDefinition.output == "") {
        return; // not a view
      }

      const methodInputs = testDefinition.inputs;
      if (methodInputs.length > 0) {
        for (let i = 0; i < methodInputs.length; i++) {
          testDescription += methodInputs[i]
          if (i + 1 != methodInputs.length) {
            testDescription += ", ";
          }
        }
      }
      testDescription += ") view " + (shouldFail ? "fails " : "");

      if (testDefinition.desc) {
        testDescription += "when " + testDefinition.desc;
      }

      testDescription += " [Test: " + testName + "]";

      it(testDescription, async() => {
        let failed = false;
        let failReason: any;
        let liveTestDefinition = config.getTestMethod(testName);

        try {
          await verifyView(liveTestDefinition);
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
      defineViewTest(key);
    });
  });
}