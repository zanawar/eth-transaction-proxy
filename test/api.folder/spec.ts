import "mocha";
import * as fs from "fs";
import * as mkdirp from "mkdirp";
import * as assert from "assert";
import * as folder from "./setup";
import { FolderABISource } from "eth-transaction-proxy";
import { testBedContract, migrationContract } from "../common.setup";
import * as path from "path";

const buildDirectory = "./build/api.folder";
let folderABISource: FolderABISource;

before(`Copying built contract ABIs to ${buildDirectory}...`, () => {
  return folder.setup(buildDirectory);
});

describe("FolderABISource", () => {
  describe("constructor", () => {

    it("fails when directory doesn't exist", () => {
      const directory = "./does_not_exist";
      assert.throws(
        () => new FolderABISource(directory),
        Error, `Error: FolderABISource's directory does not exist (${directory})`
      );
    });

    it("fails when directory given is actually file", (done) => {
      const fileName = `${buildDirectory}tmp`;
      fs.writeFileSync(fileName, "...");

      assert.throws(
        () => new FolderABISource(fileName),
        Error, `Error: FolderABISource's directory does not exist (${fileName})`
      );

      fs.unlinkSync(fileName);
      done();
    });

    it("succeeds when directory is valid", () => {
      assert.doesNotThrow(() => {
        folderABISource = new FolderABISource(buildDirectory);
      });
    });

  });
  describe(".getABIMetadatas", () => {

    it("should succeed in the normal case (flat directory, N valid files)", () => {
      return folderABISource.getABIMetadatas()
        .then((metadatas: any) => {
          assert.equal(metadatas.length, 2);

          const abi0 = metadatas[0];
          const abi1 = metadatas[1];

          assert.equal(abi0.contractName, migrationContract);
          assert.equal(abi1.contractName, testBedContract);
        })
        .catch((err: Error) => {
          assert.fail(err.message);
        });
    });

    it("should work if ABI json is on separate lines", () => {
      folder.insertABI(buildDirectory, "Test.json", { contractName: "Test" });
      return folderABISource.getABIMetadatas()
        .then((metadatas: any) => {
          assert.equal(metadatas.length, 3);

          const abi0 = metadatas[0];
          const abi1 = metadatas[1];
          const abi2 = metadatas[2];

          assert.equal(abi0.contractName, migrationContract);
          assert.equal(abi1.contractName, "Test");
          assert.equal(abi2.contractName, testBedContract);
        })
        .catch((err: Error) => {
          assert.fail(err.message);
        })
        .then(() => {
          folder.removeABI(buildDirectory, "Test.json");
        });
    });

    it("should work if ABI json is all on one line", () => {
      folder.insertABI(buildDirectory, "Test.json", { contractName: "Test" }, false);
      return folderABISource.getABIMetadatas()
        .then((metadatas: any) => {
          assert.equal(metadatas.length, 3);

          const abi0 = metadatas[0];
          const abi1 = metadatas[1];
          const abi2 = metadatas[2];

          assert.equal(abi0.contractName, migrationContract);
          assert.equal(abi1.contractName, "Test");
          assert.equal(abi2.contractName, testBedContract);
        })
        .catch((err: Error) => {
          assert.fail(err.message);
        })
        .then(() => {
          folder.removeABI(buildDirectory, "Test.json");
        });
    });

    it("should omit files that don't have contractName", () => {
      folder.insertABI(buildDirectory, "Test.json", {});
      return folderABISource.getABIMetadatas()
        .then((metadatas: any) => {
          assert.equal(metadatas.length, 2);

          const abi0 = metadatas[0];
          const abi1 = metadatas[1];

          assert.equal(abi0.contractName, migrationContract);
          assert.equal(abi1.contractName, testBedContract);
        })
        .catch((err: Error) => {
          assert.fail(err.message);
        })
        .then(() => {
          folder.removeABI(buildDirectory, "Test.json");
        });
    });

    it("should fail when file name != contractName", () => {
      folder.insertABI(buildDirectory, "Test.json", { contractName: "NotTest" });
      return folderABISource.getABIMetadatas()
        .then((metadatas: any) => {
          assert.fail("One of the contractNames is incorrect, this should not succeed.");
        })
        .catch((err: Error) => {
          folder.removeABI(buildDirectory, "Test.json");
        });
    });

    it("should be able to recurse subfolders", () => {
      folder.insertABI(`${buildDirectory}/test`, "Test.json", { contractName: "Test" });
      return folderABISource.getABIMetadatas()
        .then((metadatas: any) => {

          let foundSubdirectoryContract = false;
          const searchFile = path.resolve(`${buildDirectory}/test/Test.json`);
          metadatas.forEach((element : any) => {
            if (path.resolve(element.filePath) == searchFile) {
              foundSubdirectoryContract = true;
            }
          });

          assert(foundSubdirectoryContract, "Could not find metadata.");
        })
        .catch((err: Error) => {
          assert.fail(err.message);
        })
        .then(() => {
          folder.removeABI(`${buildDirectory}/test`, "Test.json");
        });
    });

    it("should omit empty files", () => {
      folder.insertABI(buildDirectory, "Test.json", undefined);
      return folderABISource.getABIMetadatas()
        .then((metadatas: any) => {

          const searchFile = path.resolve(`${buildDirectory}/Test.json`);
          metadatas.forEach((element : any) => {
            if (path.resolve(element.filePath) == searchFile) {
              assert.fail("Should not have found Test.json");
            }
          });
        })
        .catch((err: Error) => {
          assert.fail(err.message);
        })
        .then(() => {
          folder.removeABI(buildDirectory, "Test.json");
        });
    });

  });
  describe(".getABI(contractName)", () => {

    it("should succeed in the normal case (flat directory, 1 valid file)", () => {
      return folderABISource.getABI(testBedContract)
        .then((abi: any) => {
          assert.notEqual(abi, undefined);
          assert.equal(abi.contractName, testBedContract);
          assert.notEqual(abi.abi, undefined);
        })
        .catch((err: Error) => {
          assert.fail(err.message);
        });
    });

    it("should return undefined if contract doesn't exist", () => {
      return folderABISource.getABI("Foo")
        .then((abi: any) => {
          assert.equal(abi, undefined);
        })
        .catch((err: Error) => {
          assert.fail(err.message);
        });
    });

    it("should fail if more than one contract by the same name exists", () => {
      folder.insertABI(`${buildDirectory}/test`, "TestBed.json", { contractName: testBedContract });
      return folderABISource.getABI(testBedContract)
        .then((abi: any) => {
          assert.fail("There are multiple contracts by the same name, this should not succeed.");
        })
        .catch((err: Error) => {
          folder.removeABI(`${buildDirectory}/test`, "TestBed.json");
        });
    });

    it("should fail when file name != contractName", () => {
      folder.insertABI(buildDirectory, "Test.json", { contractName: "NotTest" });
      return folderABISource.getABI("Test")
        .then((abi: any) => {
          assert.fail("This shouldn't succeed, the names don't match.");
        })
        .catch((err: Error) => {
          folder.removeABI(buildDirectory, "Test.json");
        });
    });

    it("should fail when file is empty", () => {
      folder.insertABI(buildDirectory, "Test.json", undefined);
      return folderABISource.getABI("Test")
        .then((abi: any) => {
          assert.fail("This shouldn't succeed, the file is empty.");
        })
        .catch((err: Error) => {
          folder.removeABI(buildDirectory, "Test.json");
        });
    });

    it("should fail when missing contractName", () => {
      folder.insertABI(buildDirectory, "Test.json", { });
      return folderABISource.getABI("Test")
        .then((abi: any) => {
          assert.fail("This shouldn't succeed, the file is empty.");
        })
        .catch((err: Error) => {
          folder.removeABI(buildDirectory, "Test.json");
        });
    });

    it("should fail when json is invalid", () => {
      mkdirp.sync(buildDirectory);
      fs.writeFileSync(`${buildDirectory}/Test.json`, '{contractName: "Test", abi: {}');
      return folderABISource.getABI("Test")
        .then((abi: any) => {
          assert.fail("This shouldn't succeed, the json is invalid.");
        })
        .catch((err: Error) => {
          folder.removeABI(buildDirectory, "Test.json");
        });
    });

  });
});
