export interface ITransactionConfig {
  from: string;
  to?: string;
  contractName: string;
  method: string;
  arguments: any;
  extraGas?: number;
}
