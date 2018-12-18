import * as find from "find";
import * as fs from "fs";
import * as readLine from "readline";
import { FileABIMetadata } from "./FileABIMetadata";

export const getFilePaths = (directory: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    find.file(/^(.*).json/, directory, (files) => {
      resolve(files);
    })
    .error((err) => reject(err));
  });
};

// recurse down directories and try to find the file
export const findUniqueFileByName = (rootDirectory: string, fileName: string): Promise<string> => {

  return new Promise((resolve, reject) => {
    find.file(fileName, rootDirectory, (files) => {
      if (files.length > 1) {
        reject("Error: More than one file by the name ${fileName} found.");
      } else if (files.length === 0) {
        resolve(undefined);
      } else {
        resolve(files[0]);
      }
    })
    .error((err) => reject(err));
  });
};

export const tryGetABIMetadata = (filePath: string): Promise<FileABIMetadata | undefined> => {

  return new Promise((resolve, reject) => {

    // stream the first few lines of the file and look for the contract name
    const readStream = fs.createReadStream(filePath);
    const lineReader = readLine.createInterface({
      input: readStream,
    });

    const fileName = filePath.replace(/^.*[\\\/]/, "");
    let metadata: FileABIMetadata | undefined;
    let failed = false;

    const stopReading = () => {
      lineReader.close();
      readStream.destroy();
    };

    lineReader.on("line", (line: string) => {

      // manually return since lineReader buffers some lines
      if (metadata || failed) {
        return;
      }

      // check for "contractName" member
      const match = line.match("\"contractName\"\\s?:\\s?\"(.*)\"");

      if (match && match.length > 1) {

        // make sure there aren't multiple 'contractName' properties defined
        if (match.length > 2) {
          stopReading();
          failed = true;
          reject(`Error: multiple 'contractName' members defined in ${fileName}`);
          return;
        }

        const contractName = match[1];

        // we have a name, now make sure it matches the filename
        if (`${contractName}.json` !== fileName) {
          stopReading();
          failed = true;
          reject(`Error: The file name doesn't match the contract name in ${fileName}.`);
          return;
        }

        // the contract name matches the file name,
        // let's create the metadata and be done
        metadata = new FileABIMetadata(contractName, filePath);
        lineReader.close();
        resolve(metadata);
      }
    });

    lineReader.on("error", (error) => {
      lineReader.close();
    });

    lineReader.on("close", () => {
      resolve(metadata);
    });

  });
};

export const parseABI = (filePath: string): any => {
  let data;

  try {
    data = fs.readFileSync(filePath, { encoding: "utf8" });
  } catch (e) {
    throw new Error(`Error: unable to readFile ${filePath}\n${e}`);
  }

  try {
    const json = JSON.parse(data);

    if (json.contractName) {
      return json;
    } else {
      throw new Error(`Error: ABI missing "contractName" property\n${filePath}\n${json}`);
    }
  } catch (e) {
    throw new Error(`Error: exception while parsing json\n${e}`);
  }
};
