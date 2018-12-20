export interface IContract {
  contractName: string;
  abi(): Promise<any>;
}
