export interface IABIMetadata {
  contractName: string;
  getABI(): Promise<any>;
}
