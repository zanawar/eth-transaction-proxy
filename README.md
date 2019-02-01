# Transaction Proxy
The Transaction Proxy aims to abstract away smart contract interactions to help simplify business logic. It facilitates:  
* Transaction Payload Creation (Given: Contract Name, Method Name, Arguments)  
* Signed Transaction Submission
* Smart Contract Data Viewing

# Using the library
The Transaction Proxy code is packaged as a library which can be consumed as an npm library.  
Included in this repository is an implementation of the library, exposed as a Web API using Azure Functions for Docker.

## Example Usage
Using the library in your own code may look like:
```ts
import { AzureBlobContractSource, ContractRepository, TransactionProxy } from "eth-transaction-proxy";

const contractRepository = new ContractRepository([
  new AzureBlobContractSource("connection-string", "container")
]);
const proxy = new TransactionProxy(contractRepostiory, "rpc_endpoint")

// Call a smart contract view method
let result = await proxy.view({
  from: "0xsender",
  to: "0xcontract_address",
  contractName: "myContract",
  method: "viewMethod",
  arguments: null
});

// Create a transaction payload to call a smart contract method
let payload = await proxy.create({
  from: "0xsender",
  to: "0xcontract_address",
  contractName: "myContract",
  method: "contractMethod",
  arguments: null
});

```

An example implementation of the Transaction Proxy, exposed through a Web API using Azure Functions is included in the `implementation/functions` folder of the repository.

# Project Structure
- src: Transaction Proxy library source code
- test: Code modules to test the different features of the Transaction Proxy library
- test-docker: Dockerfile and compose for running tests inside a docker container.
- implementation: Example implementations of the Transaction Proxy exposed as a Web API using Azure Functions.
- bin: Build artifacts output *(This will be generated on build)*


# Pre-Build Steps

## Prerequisities
For best results use NodeJS 10.15.0 or above. 

`node-gyp` must be installed and working on your machine.  
For information on how to install `node-gyp` see here: https://github.com/nodejs/node-gyp

## Windows
Windows users may have to run:
`npm install --global --production windows-build-tools` (this takes a few minutes)

# Build the Library
Run the commands  
```
npm install
npm run build
``` 

The Transaction Proxy library will build and output into the `bin/eth-transaction-proxy/` directory.

# Testing
Consult `TESTING.md` for more information.   
Run the commands:
```
npm run install-test
npm run build-test
npm run test
```
