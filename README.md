# Transaction Proxy
The Transaction Proxy aims to abstract away smart contract interactions to help simplify business logic. It facilitates:  
* Transaction Payload Creation (Given: Contract Name, Method Name, Arguments)  
* Signed Transaction Submission
* Smart Contract Data Viewing

# Implementation
The Transaction Proxy is implemented as a Node.JS library and must be consumed and exposed.

# Project Structure
- src: Transaction Proxy library source code
- test: Code modules to test the different features of the Transaction Proxy library
- tools: Deployment and build tools
- examples: Example implementations of the Transaction Proxy, view `examples/README.md` for more information.
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
