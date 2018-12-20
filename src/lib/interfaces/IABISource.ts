import { IABIMetadata } from "./IABIMetadata";

export interface IABISource {
  list(): Promise<IABIMetadata[]>;
  get(contractName: string): Promise<IABIMetadata>;
}
