import "mocha";
import * as assert from "assert";
import * as request from "request";
import { setup, accountAddr, testBedContractAddr, web3, accountPriv } from "./setup";
import { testBedContract } from "../common.setup";

var functionUrl: string;
var ganacheUrl: string;
var blobConnection: string;
var blobContainer: string;

const getEnvVar = (name: string, defaultValue: string): string => {
  const envVar = process.env[name];

  if (!envVar) {
    return defaultValue;
  } else {
    return envVar;
  }
};

before("Make sure the Azure Functions container is setup...", () => {
  functionUrl = getEnvVar("NOTARY_URL", "http://localhost:8585");
  ganacheUrl = getEnvVar("RPC_URL", "http://localhost:8545");
  blobConnection = getEnvVar("BLOB_CONNECT_STR", "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://localhost:8555/devstoreaccount1;");
  blobContainer = getEnvVar("BLOB_CONTAINER_NAME", "contracts");

  return setup(
    functionUrl,
    ganacheUrl,
    blobConnection,
    blobContainer
  );
});

describe("AzFunctions", () => {
  var transactionPackage: any;

  describe("CreateTransaction", () => {
    it("should create a transaction payload", () => {
      const body = {
        to: testBedContractAddr,
        from: accountAddr,
        contractName: testBedContract,
        method: "addAddressMapping",
        arguments: {
          addr: accountAddr,
          str: "foobar",
        },
      };

      return new Promise((resolve, reject) => {
        request.post(`${functionUrl}/notary/transaction/create`, {
          body: JSON.stringify(body)
        }, (err, res, body) => {
          if (err) {
            reject(err);
          } else {
            const bodyJson = JSON.parse(res.body);
            assert.equal(bodyJson.from.toLowerCase(), accountAddr.toLowerCase());
            transactionPackage = bodyJson;
            resolve();
          }
        });
      });
    });
  });

  describe("SubmitTransaction", () => {
    it("should submit to the chain", () => {
      return new Promise((resolve, reject) => {
        web3.eth.accounts.signTransaction(transactionPackage, accountPriv)
          .then((signed) => {
            const body = {
              rawSignedTransaction: signed.rawTransaction
            };

            request.post(`${functionUrl}/notary/transaction/submit`, {
              body: JSON.stringify(body)
            }, (err, res, body) => {
              if (err) {
                reject(err);
              } else {
                const bodyJson = JSON.parse(res.body);
                assert.equal(bodyJson.from.toLowerCase(), accountAddr.toLowerCase());
                resolve();
              }
            });
          })
          .catch(reject);
      });
    });
  });

  describe("SubmitView", () => {
    it("should be able to read from the chain", () => {
      const body = {
        to: testBedContractAddr,
        from: accountAddr,
        contractName: testBedContract,
        method: "getAddressMappingString",
        arguments: {
          addr: accountAddr,
        },
      };

      return new Promise((resolve, reject) => {
        request.post(`${functionUrl}/notary/view/submit`, {
          body: JSON.stringify(body)
        }, (err, res, body) => {
          if (err) {
            reject(err);
          } else {
            const bodyJson = JSON.parse(res.body);
            assert.equal(bodyJson.toString(), "foobar");
            resolve();
          }
        });
      });
    });
  });
});
