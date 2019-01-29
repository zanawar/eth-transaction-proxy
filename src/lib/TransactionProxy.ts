import { ContractRepo } from "./ContractRepo";
import { ITransactionConfig } from "./interfaces/ITransactionConfig";
import { IViewConfig } from "./interfaces/IViewConfig";
import { EncodeFunctionCall } from "./internal/EncodeFunctionCall";
import Web3 = require("web3");
import { TransactionReceipt } from "web3/types";
const isAddress = Web3.utils.isAddress;

// TODO: Support querying an address for the ABI, instead of using ABI files
// // we should support using an address in the ABI file, or being given one.

// TODO: Support creating a TransactionProxy without a ContractRepo, that way
// // you don't have to create one if you're just submitting a transaction.

export class TransactionProxy {
  private contractRepo: ContractRepo | undefined;
  private web3: Web3;

  constructor(
    contractRepo?: ContractRepo,
    rpcUrl?: string,
    web3?: Web3,
    connectionTest?: (result: Promise<boolean>, web3: Web3) => void,
  ) {
    this.contractRepo = contractRepo;

    if (web3) {
      this.web3 = web3;
    } else if (rpcUrl) {
      this.web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
    } else {
      this.web3 = new Web3();
      connectionTest = undefined;
    }

    if (connectionTest) {
      connectionTest(
        this.web3.eth.net.isListening(),
        this.web3,
      );
    }
  }

  /*
  Creates a transaction payload from an input transaction config
  */
  public async create(config: ITransactionConfig): Promise<any> {
    if (this.contractRepo === undefined) {
      throw Error("No Contract Repo has been set for the Transaction Proxy.");
    }

    if (!isAddress(config.from) || !isAddress(config.to)) {
      throw Error(`'from' and 'to' fields must be valid addresses.`);
    }

    const abi = await this.contractRepo.getContractABI(config.contractName);
    if (abi === undefined) {
      throw Error(`Unable to find abi for the specified contract name.`);
    }

    const abiDesc = abi.abi as any[];
    const deployedCode = abi.deployedBytecode as string;
    const tx = {
      from: config.from,
      to: config.to,
      data: EncodeFunctionCall(this.web3, abiDesc, config.arguments, config.method),
    };

    let txNonce;
    let txGasPrice;
    let txGasLimit;

    // If web3 has a provider we can check to see if the contract at the address given is the contract we're expecting
    if (this.web3.currentProvider) {

      // Verify that the 'to' address is actually the contract
      const contractCode = await this.web3.eth.getCode(tx.to);
      if (deployedCode !== contractCode) {
        throw Error(`Contract at address '${config.to}' is not of type '${config.contractName}'`);
      }

      txNonce = await this.web3.eth.getTransactionCount(config.from);
      txGasPrice = await this.web3.eth.getGasPrice();
      txGasLimit = await this.web3.eth.estimateGas(tx) + (config.extraGas ? config.extraGas : 0);
    }

    // Return the formatted transaction payload
    return {
      from: tx.from,
      to: tx.to,
      data: tx.data,
      nonce: txNonce,
      gasPrice: txGasPrice,
      gasLimit: txGasLimit,
    };
  }

  /*
  Submits the hex of a signed transaction.
  This would be the 'raw' field returned from web.eth.signTransaction
  */
  public async submit(signedTransactionHex: string): Promise<TransactionReceipt> {
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

  /*
  Performs a view operation from a view config.
  */
  public async view(config: IViewConfig): Promise<any> {
    if (this.contractRepo === undefined) {
      throw Error("No Contract Repo has been set for the Transaction Proxy.");
    }

    if (!this.web3.currentProvider) {
      throw Error(`No web3 provider has been set for the Transaction Proxy.`);
    }

    if (!isAddress(config.to)) {
      throw Error(`'to' field must be a valid address. Passed in: to='${config.to}'`);
    }

    if (config.from && !isAddress(config.from)) {
      throw Error(`'from' field must be a valid address. Passed in: from='${config.from}'`);
    }

    // get contract abi
    const abi = await this.contractRepo.getContractABI(config.contractName);
    const deployedCode = abi.deployedBytecode;

    // Verify that the 'to' address is actually the contract
    const contractCode = await this.web3.eth.getCode(config.to);
    if (deployedCode !== contractCode) {
      throw Error(`Contract at address '${config.to}' is not of type '${config.contractName}'`);
    }

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
