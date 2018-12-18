import "mocha";
import * as rimraf from "rimraf";
import * as fs from "fs";
import * as mkdirp from "mkdirp";
import * as assert from "assert";
import * as folder from "./setup";
import { FolderABISource } from "../../api/lib";
import { testBedContract, migrationContract } from "../common.setup";

const buildDirectory = "./build/api.folder/";
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

      rimraf(fileName, (err) => {
        if (err) {
          assert.fail(err.message);
        }
        done();
      });
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
          assert.equal(metadatas.length, 3);

          const abi0 = metadatas[0];
          const abi1 = metadatas[1];
          const abi2 = metadatas[2];

          assert.equal(abi0.contractName, migrationContract);
          assert.equal(abi1.contractName, testBedContract);
          assert.equal(abi2.contractName, "Test");
        })
        .catch((err: Error) => {
          assert.fail(err.message);
        })
        .then(() => {
          folder.removeABI(`${buildDirectory}/test`, "Test.json");
        });
    });

    it("should be able to recurse complex subfolders", () => {
      folder.insertABI(`${buildDirectory}/test`, "Test.json", { contractName: "Test" });
      folder.insertABI(`${buildDirectory}/test/lower`, "TestLower.json", { contractName: "TestLower" });
      folder.insertABI(`${buildDirectory}/another`, "Another.json", { contractName: "Another" });
      folder.insertABI(`${buildDirectory}/test/another`, "TestAnother.json", { contractName: "TestAnother" });
      folder.insertABI(`${buildDirectory}/test/lower/another`, "TestLowerAnother.json", { contractName: "TestLowerAnother" });
      return folderABISource.getABIMetadatas()
        .then((metadatas: any) => {
          assert.equal(metadatas.length, 7);

          const abi0 = metadatas[0];
          const abi1 = metadatas[1];
          const abi2 = metadatas[2];
          const abi3 = metadatas[3];
          const abi4 = metadatas[4];
          const abi5 = metadatas[5];
          const abi6 = metadatas[6];

          assert.equal(abi0.contractName, migrationContract);
          assert.equal(abi1.contractName, testBedContract);
          assert.equal(abi2.contractName, "Another");
          assert.equal(abi3.contractName, "Test");
          assert.equal(abi4.contractName, "TestAnother");
          assert.equal(abi5.contractName, "TestLower");
          assert.equal(abi6.contractName, "TestLowerAnother");
        })
        .catch((err: Error) => {
          assert.fail(err.message);
        })
        .then(() => {
          folder.removeABI(`${buildDirectory}/test`, "Test.json");
          folder.removeABI(`${buildDirectory}/test/lower`, "TestLower.json");
          folder.removeABI(`${buildDirectory}/another`, "Another.json");
          folder.removeABI(`${buildDirectory}/test/another`, "TestAnother.json");
          folder.removeABI(`${buildDirectory}/test/lower/another`, "TestLowerAnother.json");
        });
    });

    it("should omit empty files", () => {
      folder.insertABI(buildDirectory, "Test.json", undefined);
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

  });
  describe(".getABIs()", () => {

    it("should succeed in the normal case (flat directory, N valid files)", () => {
      return folderABISource.getABIs()
        .then((abis: any) => {
          assert.equal(abis.length, 2);

          const abi0 = abis[0];
          const abi1 = abis[1];

          assert.equal(abi0.contractName, migrationContract);
          assert.notEqual(abi0.abi, undefined);
          assert.equal(abi1.contractName, testBedContract);
          assert.notEqual(abi1.abi, undefined);
        })
        .catch((err: Error) => {
          assert.fail(err.message);
        });
    });

    it("should work if ABI json is on seperate lines", () => {
      folder.insertABI(buildDirectory, "Test.json", { contractName: "Test", abi: [ ] });
      return folderABISource.getABIs()
        .then((abis: any) => {
          assert.equal(abis.length, 3);

          const abi0 = abis[0];
          const abi1 = abis[1];
          const abi2 = abis[2];

          assert.equal(abi0.contractName, migrationContract);
          assert.notEqual(abi0.abi, undefined);
          assert.equal(abi1.contractName, "Test");
          assert.notEqual(abi1.abi, undefined);
          assert.equal(abi2.contractName, testBedContract);
          assert.notEqual(abi2.abi, undefined);
        })
        .catch((err: Error) => {
          assert.fail(err.message);
        })
        .then(() => {
          folder.removeABI(buildDirectory, "Test.json");
        });
    });

    it("should work if ABI json is all on one line", () => {
      folder.insertABI(buildDirectory, "Test.json", { contractName: "Test", abi: [ ] }, false);
      return folderABISource.getABIs()
        .then((abis: any) => {
          assert.equal(abis.length, 3);

          const abi0 = abis[0];
          const abi1 = abis[1];
          const abi2 = abis[2];

          assert.equal(abi0.contractName, migrationContract);
          assert.notEqual(abi0.abi, undefined);
          assert.equal(abi1.contractName, "Test");
          assert.notEqual(abi1.abi, undefined);
          assert.equal(abi2.contractName, testBedContract);
          assert.notEqual(abi2.abi, undefined);
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
      return folderABISource.getABIs()
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
      return folderABISource.getABIs()
        .then((metadatas: any) => {
          assert.fail("One of the contractNames is incorrect, this should not succeed.");
        })
        .catch((err: Error) => {
          folder.removeABI(buildDirectory, "Test.json");
        });
    });

    it("should fail when json is invalid", () => {
      mkdirp.sync(buildDirectory);
      fs.writeFileSync(`${buildDirectory}/Test.json`, '{contractName: "Test", abi: {}');
      return folderABISource.getABIs()
        .then((metadatas: any) => {
          assert.fail("One of the contractNames is incorrect, this should not succeed.");
        })
        .catch((err: Error) => {
          folder.removeABI(buildDirectory, "Test.json");
        });
    });

    it("should fail when multiple files have the same contractName", () => {
      folder.insertABI(buildDirectory, "Test.json", { contractName: "Test", abi: [ ] });
      folder.insertABI(`${buildDirectory}/test`, "Test.json", { contractName: "Test", abi: [ ] });
      return folderABISource.getABIs()
        .then((abis: any) => {
          assert.fail("One of the contractNames is incorrect, this should not succeed.");
        })
        .catch((err: Error) => {
          folder.removeABI(buildDirectory, "Test.json");
          folder.removeABI(`${buildDirectory}/test`, "Test.json");
        });
    });

    it("should omit files that are empty", () => {
      mkdirp.sync(buildDirectory);
      fs.writeFileSync(`${buildDirectory}/Test.json`, "");
      return folderABISource.getABIs()
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
