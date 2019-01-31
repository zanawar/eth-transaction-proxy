import * as assert from "assert";
import Web3 = require("web3");
import * as ganache from "ganache-core";
import * as common from "../common.setup";
import { testBedContract } from "../common.setup";
import { TransactionProxy, ContractRepo, FolderContractSource } from "eth-transaction-proxy";

export class TestTransaction {
  package: any;
  receipt: any;
}

export class Config {
  web3!: Web3;
  proxy!: TransactionProxy;
  contractRepo!: ContractRepo;

  accountAddr!: string;
  accountPriv!: string;
  contractAddress!: string;

  // transaction packages
  addAddressMappingTest = new TestTransaction();
  getAddressMappingStringTest = new TestTransaction();
  updateStructureTextTest = new TestTransaction();
  getStructTextTest = new TestTransaction();
  getMappedBoolTest = new TestTransaction();
  modifyBoolTest = new TestTransaction();
  getBoolTest = new TestTransaction();
  modifyint8Test = new TestTransaction();
  getint8Test = new TestTransaction();
  modifyint256Test = new TestTransaction();
  getint256Test = new TestTransaction();
  modifyuint8Test = new TestTransaction();
  getuint8Test = new TestTransaction();
  modifyuint256Test = new TestTransaction();
  getuint256Test = new TestTransaction();
  modifybytes1Test = new TestTransaction();
  getbytes1Test = new TestTransaction();
  modifybytes32Test = new TestTransaction();
  getbytes32Test = new TestTransaction();
  modifybytesTest = new TestTransaction();
  getRandomBytesTest = new TestTransaction();
  getArbitraryAddressBalanceTest = new TestTransaction();
  getSenderAddressBalanceTest = new TestTransaction();
  testSpawnEventUintTest = new TestTransaction();
  testSpawnEventWithAddressTest = new TestTransaction();
};

const web3Log: string[] = [];

const web3Logger = {
  log(msg: string): void {
    web3Log.push(msg);
  }
}

const web3NetId: number = 665;

export const setup = (config: Config): Promise<void> => {
  return new Promise((resolve, reject) => {
    return common.setup()
      .then(() => {
        let contractSource = new FolderContractSource(common.abiDirectory);
        config.contractRepo = new ContractRepo([contractSource]);

        config.accountAddr = "0xb8CE9ab6943e0eCED004cDe8e3bBed6568B2Fa01";
        config.accountPriv = "0x348ce564d427a3311b6536bbcff9390d69395b06ed6c486954e971d960fe8709";

        let web3Provider: any = ganache.provider({
          network_id: web3NetId,
          logger: web3Logger,
          accounts: [
            {
              balance: "0xFFFFFFFFFFFFFFFF",
              secretKey: config.accountPriv
            }
          ]
        } as any);

        config.web3 = new Web3(
          web3Provider
        );

        return config.web3.eth.getAccounts();
      })
      .then((accounts) => {
        config.accountAddr = accounts[0].toLowerCase();
        return config.contractRepo.getContractABI(testBedContract);
      })
      .then((testBedABI) => {
        // create new contract instance (not deployed yet)
        const contract = new config.web3.eth.Contract(
          testBedABI.abi,
          undefined,
          {
            from: config.accountAddr,
            gas: 4712388,
            gasPrice: "100000000000"
          }
        );

        // now let's deploy it to the chain and save its address
        let bytecode = testBedABI.bytecode as string;

        if (!bytecode) {
          assert.fail("Error: bytecode is null in TestBed contract");
        }

        return contract.deploy({
          data: bytecode,
          arguments: []
        })
        .send({
          from: config.accountAddr,
          gas: 4712388,
          gasPrice: 100000000000
        })
        .on("error", (err: any) => reject(err))
        .then((contractInstance: any) => {
          config.contractAddress = contractInstance.options.address.toLowerCase();
          resolve();
        });
      })
      .catch(reject);
  });
};