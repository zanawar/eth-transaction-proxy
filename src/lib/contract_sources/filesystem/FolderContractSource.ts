import * as fs from "fs";
import { IContract } from "../../interfaces/IContract";
import { IABISource } from "../../interfaces/IABISource";
import { FileContract } from "./FileContract";
import { findUniqueFileByName, getFilePaths, tryGetContractMetadata } from "./FileUtils";

// Note: Requires that the fileName == contractName
export class FolderContractSource implements IABISource {
  private directory: string;

  constructor(directory: string) {
    if (!fs.existsSync(directory) || !fs.statSync(directory).isDirectory()) {
      throw new Error(`Error: FolderContractSource's directory does not exist (${directory})`);
    }

    this.directory = directory;
  }

  public list(): Promise<IContract[]> {

    return new Promise((resolve, reject) => {
      return getFilePaths(this.directory)
        .then((filePaths: string[]) => {
          const metadataPromises: Promise<IContract | undefined>[] = [];

          for (const filePath of filePaths) {
            metadataPromises.push(tryGetContractMetadata(filePath));
          }

          return Promise.all(metadataPromises);
        })
        .then((metadatas: any[]) => {
          resolve(metadatas.filter((value) => value !== undefined));
        })
        .catch((err: Error) => reject(err));
    });
  }

  public get(contractName: string): Promise<IContract> {
    // recurse down directories and try to find the file named ${contractName}.json
    return new Promise((resolve, reject) => {
      return findUniqueFileByName(this.directory, `${contractName}.json`)
            .then((fileName) => {
              if (fileName) {
                return tryGetContractMetadata(fileName);
              } else {
                return undefined;
              }
            })
            .then((metadata?: FileContract) => {
              resolve(metadata);
            })
            .catch(reject);
    });
  }
}
