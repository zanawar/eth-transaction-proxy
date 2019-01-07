import { ContractRepo } from "./ContractRepo";
import { ITransactionConfig } from "./interfaces/ITransactionConfig";
import { IViewConfig } from "./interfaces/IViewConfig";
import { EncodeFunctionCall } from "./internal/EncodeFunctionCall";
import Web3 = require("web3");
import { TransactionReceipt } from "web3/types";
const isAddress = Web3.utils.isAddress;

// TODO: Support querying an address for the ABI, instead of using ABI files
// // we should support using an address in the ABI file, or being given one.

// TODO: Support creating a TransactionNotary without a ContractRepo, that way
// // you don't have to create one if you're just submitting a transaction.

export class TransactionNotary {
  private contractRepo: ContractRepo;
  private web3: Web3;

  constructor(
    contractRepo: ContractRepo,
    rpcUrl: string, web3?: Web3,
    connectionTest?: (result: Promise<boolean>, web3: Web3) => void,
  ) {
    this.contractRepo = contractRepo;

    if (web3) {
      this.web3 = web3;
    } else {
      this.web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
    }

    if (connectionTest) {
      connectionTest(
        this.web3.eth.net.isListening(),
        this.web3,
      );
    }
  }

  public async createTransaction(config: ITransactionConfig): Promise<any> {
    if (!isAddress(config.from) || !isAddress(config.to)) {
      throw Error(`Error: from & to have to be valid addresses.\nfrom: ${config.from}\nto: ${config.to}`);
    }

    const abi = await this.contractRepo.getContractABI(config.contractName);

    if (abi === undefined) {
      throw Error(`Error: unable to find abi for the contract named ${config.contractName}.`);
    }

    const abiDesc = abi.abi as any[];
    const tx = {
      from: config.from,
      to: config.to,
      data: EncodeFunctionCall(this.web3, abiDesc, config.arguments, config.method),
    };
    const txNonce = await this.web3.eth.getTransactionCount(config.from);
    const txGasPrice = await this.web3.eth.getGasPrice();
    const txGasLimit = await this.web3.eth.estimateGas(tx) + (config.extraGas ? config.extraGas : 0);

    // TODO: do some checking with the "to" address
    // make sure it is the contract we're looking for.

    return {
      from: tx.from,
      to: tx.to,
      data: tx.data,
      nonce: txNonce,
      gasPrice: txGasPrice,
      gasLimit: txGasLimit,
    };
  }

  public async submitTransaction(signedTransactionHex: string): Promise<TransactionReceipt> {
    return new Promise<TransactionReceipt>((resolve, reject) => {
      return this.web3.eth.sendSignedTransaction(signedTransactionHex)
        .on("receipt", (receipt: TransactionReceipt) => {
          resolve(receipt);
        })
        .on("error", (err: Error) => {
          reject(err);
        });
    });
  }

  public async submitView(config: IViewConfig): Promise<any> {
    if (!isAddress(config.to)) {
      throw Error(`Error: to must be a valid address. \nto: ${config.to}`);
    }

    if (config.from && !isAddress(config.from)) {
      throw Error(`Error: from must be a valid address. \nfrom: ${config.from}`);
    }

    // get contract abi
    const abi = await this.contractRepo.getContractABI(config.contractName);

    // get contract instance from abi
    const contract = new this.web3.eth.Contract(abi.abi, config.to);

    // get all arguments out of arguments
    const args = [] as any[];
    const configArgKeys = Object.keys(config.arguments);

    for (const key of configArgKeys) {
      args.push(config.arguments[key]);
    }

    return new Promise((resolve, reject) => {

      const callArgs = config.from ? { from: config.from } : { };

      return contract.methods[config.method](...args).call(callArgs)
        .then((result) => {
          resolve(JSON.stringify(result));
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
