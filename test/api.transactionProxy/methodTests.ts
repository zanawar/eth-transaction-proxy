import { Config } from "./setup";
import { testBedContract } from "../common.setup";

export const MethodTests = (config: Config) => {
  let accountAddr = config.accountAddr;
  let contractAddress = config.contractAddress;
  const extraGas = 1000;

  return {
    "constructorWithTo": {
      "transaction": {
        from: accountAddr,
        to: contractAddress,
        contractName: testBedContract,
        method: "constructor",
        arguments: {}
      },
      "signature": {
        "inputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      "inputs": [],
      "output": ""
    },
    "constructor": {
      "transaction": {
        from: accountAddr,
        contractName: testBedContract,
        method: "constructor",
        arguments: {}
      },
      "signature": {
        "inputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      "inputs": [],
      "output": ""
    },
    "addAddressMapping": {
      "transaction": {
        from: accountAddr,
        to: contractAddress,
        contractName: testBedContract,
        method: "addAddressMapping",
        arguments: {
          addr: "0x1234567890123456789012345678901234567891",
          str: "something important"
        }
      },
      "signature": {
        "constant": false,
        "inputs": [
          {
            "name": "addr",
            "type": "address"
          },
          {
            "name": "str",
            "type": "string"
          }
        ],
        "name": "addAddressMapping",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      "inputs": [
        "0x1234567890123456789012345678901234567891",
        "something important"
      ],
      "output": ""
    },
    "getAddressMappingString": {
      "transaction": {
        from: accountAddr,
        to: contractAddress,
        contractName: testBedContract,
        method: "getAddressMappingString",
        arguments: {
          addr: "0x1234567890123456789012345678901234567891"
        },
        extraGas: extraGas
      },
      "inputs": [
        "0x1234567890123456789012345678901234567891"
      ],
      "output": "some text"
    },
    "updateStructText": {
      "transaction": {
        from: accountAddr,
        to: contractAddress,
        contractName: testBedContract,
        method: "updateStructText",
        arguments: {
          context: "some text"
        }
      },
      "signature": {
        "constant": false,
        "inputs": [
          {
            "name": "sometext",
            "type": "string"
          }
        ],
        "name": "updateStructText",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      "inputs": [
        "some text"
      ],
      "output": ""
    },
    "getStructText": {
      "transaction": {
        from: accountAddr,
        to: contractAddress,
        contractName: testBedContract,
        method: "getStructText",
        arguments: {
        }
      },
      "inputs": [
      ],
      "output": "some text"
    },
    "getMappedBool": {
      "transaction": {
        from: accountAddr,
        to: contractAddress,
        contractName: testBedContract,
        method: "getMappedBool",
        arguments: {
          value: 150
        }
      },
      "inputs": [
        150
      ],
      "output": ""
    },
    "modifyBool": {
      "transaction": {
        from: accountAddr,
        to: contractAddress,
        contractName: testBedContract,
        method: "modifyBool",
        arguments: {
          value: false
        }
      },
      "signature": {
        "constant": false,
        "inputs": [
          {
            "name": "value",
            "type": "bool"
          }
        ],
        "name": "modifyBool",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      "inputs": [
        false
      ],
      "output": ""
    },
    "getBool": {
      "transaction": {
        from: accountAddr,
        to: contractAddress,
        contractName: testBedContract,
        method: "getBool",
        arguments: {
        }
      },
      "inputs": [
      ],
      "output": false
    },
    "modifyint8": {
      "transaction": {
        from: accountAddr,
        to: contractAddress,
        contractName: testBedContract,
        method: "modifyint8",
        arguments: {
          value: -8
        }
      },
      "signature": {
        "constant": false,
        "inputs": [
          {
            "name": "value",
            "type": "int8"
          }
        ],
        "name": "modifyint8",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      "inputs": [
        -8
      ],
      "output": ""
    },
    "getint8": {
      "transaction": {
        from: accountAddr,
        to: contractAddress,
        contractName: testBedContract,
        method: "getint8",
        arguments: {
        }
      },
      "inputs": [
      ],
      "output": -8
    },
    "modifyint256": {
      "transaction": {
        from: accountAddr,
        to: contractAddress,
        contractName: testBedContract,
        method: "modifyint256",
        arguments: {
          value: -9000000
        }
      },
      "signature": {
        "constant": false,
        "inputs": [
          {
            "name": "value",
            "type": "int256"
          }
        ],
        "name": "modifyint256",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      "inputs": [
        -9000000
      ],
      "output": ""
    },
    "getint256": {
      "transaction": {
        from: accountAddr,
        to: contractAddress,
        contractName: testBedContract,
        method: "getint256",
        arguments: {
        }
      },
      "inputs": [
      ],
      "output": -9000000
    },
    "modifyuint8": {
      "transaction": {
        from: accountAddr,
        to: contractAddress,
        contractName: testBedContract,
        method: "modifyuint8",
        arguments: {
          value: 255
        }
      },
      "signature": {
        "constant": false,
        "inputs": [
          {
            "name": "value",
            "type": "uint8"
          }
        ],
        "name": "modifyuint8",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      "inputs": [255
      ],
      "output": ""
    },
    "getuint8": {
      "transaction": {
        from: accountAddr,
        to: contractAddress,
        contractName: testBedContract,
        method: "getuint8",
        arguments: {
        }
      },
      "inputs": [
      ],
      "output": ""
    },
    "modifyuint256": {
      "transaction": {
        from: accountAddr,
        to: contractAddress,
        contractName: testBedContract,
        method: "modifyuint256",
        arguments: {
          value: 888
        }
      },
      "signature": {
        "constant": false,
        "inputs": [
          {
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "modifyuint256",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      "inputs": [888
      ],
      "output": ""
    },
    "getuint256": {
      "transaction": {
        from: accountAddr,
        to: contractAddress,
        contractName: testBedContract,
        method: "getuint256",
        arguments: {
        }
      },
      "inputs": [
      ],
      "output": 888
    },
    "modifybytes1": {
      "transaction": {
        from: accountAddr,
        to: contractAddress,
        contractName: testBedContract,
        method: "modifybytes1",
        arguments: {
          value: "0x2"
        }
      },
      "signature": {
        "constant": false,
        "inputs": [
          {
            "name": "value",
            "type": "bytes1"
          }
        ],
        "name": "modifybytes1",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      "inputs": [
        "0x2"
      ],
      "output": "0x2"
    },
    "getbytes1": {
      "transaction": {
        from: accountAddr,
        to: contractAddress,
        contractName: testBedContract,
        method: "getbytes1",
        arguments: {
        }
      },
      "inputs": [
      ],
      "output": "0x2"
    },
    "modifybytes32": {
      "transaction": {
        from: accountAddr,
        to: contractAddress,
        contractName: testBedContract,
        method: "modifybytes32",
        arguments: {
          value: "0xFFFF"
        }
      },
      "signature": {
        "constant": false,
        "inputs": [
          {
            "name": "value",
            "type": "bytes32"
          }
        ],
        "name": "modifybytes32",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      "inputs": ["0xFFFF"
      ],
      "output": ""
    },
    "getbytes32": {
      "transaction": {
        from: accountAddr,
        to: contractAddress,
        contractName: testBedContract,
        method: "getbytes32",
        arguments: {
        }
      },
      "inputs": [
      ],
      "outputs": "0xFFFF"
    },
    "modifybytes": {
      "transaction": {
        from: accountAddr,
        to: contractAddress,
        contractName: testBedContract,
        method: "modifybytes",
        arguments: {
          value: "0xFA2345"
        }
      },
      "signature": {
        "constant": false,
        "inputs": [
          {
            "name": "value",
            "type": "bytes"
          }
        ],
        "name": "modifybytes",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      "inputs": ["0xFA2345"
      ],
      "outputs": ""
    },
    "getRandomBytes": {
      "transaction": {
        from: accountAddr,
        to: contractAddress,
        contractName: testBedContract,
        method: "getRandomBytes",
        arguments: {
        }
      },
      "inputs": [
        "0xFA2345"
      ],
      "output": ""
    },
    "getArbitraryAddressBalance": {
      "transaction": {
        from: accountAddr,
        to: contractAddress,
        contractName: testBedContract,
        method: "getArbitraryAddressBalance",
        arguments: {
          addr: accountAddr
        }
      },
      "inputs": [
        accountAddr
      ],
      "output": ""
    },
    "getSenderAddressBalance": {
      "transaction": {
        from: accountAddr,
        to: contractAddress,
        contractName: testBedContract,
        method: "getSenderAddressBalance",
        arguments: {
        }
      },
      "inputs": [
      ],
      "output": accountAddr
    },
    "testOverload": {
      "transaction": {
        from: accountAddr,
        to: contractAddress,
        contractName: testBedContract,
        method: "testOverload",
        arguments: {
          value: 8,
          other: 9
        }
      }
    },
    "testSpawnEventUint": {
      "transaction": {
        from: accountAddr,
        to: contractAddress,
        contractName: testBedContract,
        method: "testSpawnEventUint",
        arguments: {
          value: 665
        }
      },
      "signature": {
        "constant": false,
        "inputs": [
          {
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "testSpawnEventUint",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      "inputs": [665
      ],
      "output": ""
    },
    "testSpawnEventWithAddress": {
      "transaction": {
        from: accountAddr,
        to: contractAddress,
        contractName: testBedContract,
        method: "testSpawnEventWithAddress",
        arguments: {
        }
      },
      "signature": {
        "constant": false,
        "inputs": [],
        "name": "testSpawnEventWithAddress",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      "inputs": [
      ],
      "output": ""
    }
  }
}