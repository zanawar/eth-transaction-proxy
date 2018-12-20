import { IContract } from "./IContract";

export interface IABISource {
  list(): Promise<IContract[]>;
  get(contractName: string): Promise<IContract>;
}
