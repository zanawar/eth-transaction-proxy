import * as fs from "fs";
import { IABIMetadata } from "../../interfaces/IABIMetadata";
import { IABISource } from "../../interfaces/IABISource";
import { FileABIMetadata } from "./FileABIMetadata";
import { findUniqueFileByName, getFilePaths, parseABI, tryGetABIMetadata } from "./FileUtils";

// Note: Requires that the fileName == contractName
export class FolderABISource implements IABISource {
  private directory: string;

  constructor(directory: string) {
    if (!fs.existsSync(directory) || !fs.statSync(directory).isDirectory()) {
      throw new Error(`Error: FolderABISource's directory does not exist (${directory})`);
    }

    this.directory = directory;
  }

  public getABIMetadatas(): Promise<IABIMetadata[]> {

    return new Promise((resolve, reject) => {
      return getFilePaths(this.directory)
        .then((filePaths: string[]) => {
          const metadataPromises: Promise<IABIMetadata | undefined>[] = [];

          for (const filePath of filePaths) {
            metadataPromises.push(tryGetABIMetadata(filePath));
          }

          return Promise.all(metadataPromises);
        })
        .then((metadatas: any[]) => {
          resolve(metadatas.filter((value) => value !== undefined));
        })
        .catch((err: Error) => reject(err));
    });
  }

  public getABIs(): Promise<any[]> {

    return getFilePaths(this.directory)
          .then((filePaths: string[]) => {
            const jsons = [] as any[];

            filePaths.forEach((file: string) => {
              try {
                const json = parseABI(file);
                jsons.push(json);
              } catch (e) {
                // TODO: Log this
              }
            });

            return jsons;
          });
  }

  public getABI(contractName: string): Promise<any> {

    // recurse down directories and try to find the file named ${contractName}.json
    return new Promise((resolve, reject) => {
      return findUniqueFileByName(this.directory, `${contractName}.json`)
            .then((fileName) => {
              if (fileName) {
                return tryGetABIMetadata(fileName);
              } else {
                return undefined;
              }
            })
            .then((metadata?: FileABIMetadata) => {
              if (metadata !== undefined) {
                resolve(parseABI(metadata.filePath));
              } else {
                resolve(undefined);
              }
            })
            .catch(reject);
    });
  }
}