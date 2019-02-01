import Web3 = require("web3");
import { IContractSource } from "./IContractSource";

export interface IProxyConfig {
  rpcUrl?: string;
  web3?: Web3;
  sources?: IContractSource[];
}
