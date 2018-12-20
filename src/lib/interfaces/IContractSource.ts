import { IContract } from "./IContract";

export interface IContractSource {
  list(): Promise<IContract[]>;
  get(contractName: string): Promise<IContract>;
}
