export interface IContract {
  name() : string;
  abi(): Promise<any>;
}
