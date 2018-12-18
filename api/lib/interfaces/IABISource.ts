import { IABIMetadata } from "./IABIMetadata";

export interface IABISource {
  getABIMetadatas(): Promise<IABIMetadata[]>;
  getABIs(): Promise<any[]>;
  getABI(contractName: string): Promise<any>;
}
