import * as assert from "assert";
import Web3 = require("web3");
import * as ganache from "ganache-core";
import * as common from "../common.setup";
import { testBedContract } from "../common.setup";
import { TransactionProxy, ContractRepository, FolderContractSource } from "eth-transaction-proxy";

export class TestTransaction {
  package: any;
  receipt: any;
}

export class ContractData {
  bytecode!: string;
  abi: any;
}

export class Config {
  web3!: Web3;
  proxy!: TransactionProxy;
  contractRepo!: ContractRepository;

  contractData!: ContractData;

  testMethods!: any;

  accountAddr!: string;
  accountPriv!: string;
  contractAddress!: string;

  transactionResults!: Map<string, TestTransaction>;

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
  constructorTest = new TestTransaction();

  getTestMethod = (testName: string) => {
    const testMethod = this.testMethods[testName];
    testMethod.transaction.from = this.accountAddr;

    if (testMethod.transaction.method !== "constructor") {
      testMethod.transaction.to = this.contractAddress;
    }

    return testMethod;
  }
};

const web3Log: string[] = [];

const web3Logger = {
  log(msg: string): void {
    web3Log.push(msg);
  }
}

const web3NetId: number = 665;

export const setup = async (config: Config): Promise<void> => {
  await common.setup();

  let contractSource = new FolderContractSource(common.abiDirectory);
  config.contractRepo = new ContractRepository([contractSource]);

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

  const accounts = await config.web3.eth.getAccounts();
  config.accountAddr = accounts[0].toLowerCase();

  const testBedContractData = await config.contractRepo.getContractABI(testBedContract);
  config.contractData = {
    bytecode: testBedContractData.bytecode,
    abi: testBedContractData.abi
  };

  // create new contract instance (not deployed yet)
  const contract = new config.web3.eth.Contract(
    testBedContractData.abi,
    undefined,
    {
      from: config.accountAddr,
      gas: 4712388,
      gasPrice: "100000000000"
    }
  );

  // now Deploy onto chain
  let bytecode = testBedContractData.bytecode as string;
  if (!bytecode) {
    assert.fail("Error: bytecode is null in TestBed contract");
  }

  const deployedContract = await contract.deploy({
    data: bytecode,
    arguments: []
  })
  .send({
    from: config.accountAddr,
    gas: 4712388,
    gasPrice: 100000000000
  });

  config.contractAddress = deployedContract.options.address.toLowerCase();
};