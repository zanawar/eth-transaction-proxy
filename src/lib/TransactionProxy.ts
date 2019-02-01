import { ContractRepository } from "./ContractRepository";
import { IProxyConfig } from "./interfaces/IProxyConfig";
import { ITransactionConfig } from "./interfaces/ITransactionConfig";
import { IViewConfig } from "./interfaces/IViewConfig";
import { EncodeFunctionCall } from "./internal/EncodeFunctionCall";
import { EncodeConstructorCall } from "./internal/EncodeConstructorCall";
import Web3 = require("web3");
import { TransactionReceipt } from "web3/types";
import { Tx } from "web3/eth/types";
const isAddress = Web3.utils.isAddress;

export class TransactionProxy {
  private contractRepo: ContractRepository | undefined;
  private web3: Web3;

  constructor(config?: IProxyConfig) {
    if (config == null) {
      this.web3 = new Web3();
      return;
    }

    if (config.sources != null) {
      this.contractRepo = new ContractRepository(config.sources);
    }

    if (config.web3 && config.rpcUrl) {
      throw Error("Configuration includes both web3 instance and rpcUrl. One but not both can be provided.");
    }

    if (config.web3) {
      this.web3 = config.web3;
    } else if (config.rpcUrl) {
      this.web3 = new Web3(new Web3.providers.HttpProvider(config.rpcUrl));
    } else {
      this.web3 = new Web3();
    }
  }

  /*
  Test connection to RPC endpoint
  */
  public async testConnection(): Promise<boolean> {
    try {
      return await this.web3.eth.net.isListening();
    } catch {
      return false;
    }
  }

  /*
  Creates a transaction payload from an input transaction config
  */
  public async create(config: ITransactionConfig): Promise<any> {
    if (this.contractRepo === undefined) {
      throw Error("No Contract Repo has been set for the Transaction Proxy.");
    }

    const isConstructor = config.method === "constructor";

    if (!isConstructor) {
      if (config.to == null || !isAddress(config.to)) {
        throw Error("The 'to' address field must be a valid address unless the 'method' is 'constructor'.");
      }
    } else if (config.to != null) {
      throw Error("No 'to' address should be passed in when 'method' = 'constructor'.");
    }

    if (!isAddress(config.from)) {
      throw Error(`'from' must be a valid addresses.`);
    }

    const abi = await this.contractRepo.getContractABI(config.contractName);
    if (abi === undefined) {
      throw Error(`Unable to find abi for the specified contract name.`);
    }

    const abiDesc = abi.abi as any[];

    let bytecode: string;
    if (isConstructor) {
      bytecode = EncodeConstructorCall(this.web3, abiDesc, config.arguments, abi.bytecode);
    } else {
      bytecode = EncodeFunctionCall(this.web3, abiDesc, config.arguments, config.method);
    }

    const tx = {
      from: config.from,
      data: bytecode,
      to: config.to, // May be null
    } as Tx;

    let txNonce;
    let txGasPrice;
    let txGasLimit;

    if (this.web3.currentProvider) {
      // If web3 has a provider we can get nonce, gas price, limit, and more

      if (!isConstructor && tx.to != null) {
        // Check to see if the 'to' address is actually the contract we want
        const deployedCode = abi.deployedBytecode as string;

        // Verify that the 'to' address is actually the contract
        const contractCode = await this.web3.eth.getCode(tx.to);
        if (deployedCode !== contractCode) {
          throw Error(`Contract at address '${config.to}' is not of type '${config.contractName}'`);
        }
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
