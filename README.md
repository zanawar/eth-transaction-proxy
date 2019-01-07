# Transaction Notary
The Transaction Notary aims to abstract away smart contract interactions to help simplify business logic. It facilitates:  
* Transaction Payload Creation (Given: Contract Name, Method Name, Arguments)  
* Signed Transaction Submission
* Smart Contract Data Viewing

# Implementation
The Transaction Notary is implemented as a Node.JS library and must be consumed and exposed.

# Project Structure
- src: Transaction Notary library source code
- test: Code modules to test the different features of the Transaction Notary library
- tools: Deployment and build tools
- examples: Example implementations of the Transaction Notary, view `examples/README.md` for more information.
- bin: Build artifacts output *(This will be generated on build)*

# Prerequisites 
## Build Tools
- npm@latest
- node@latest (10.15.0 Recommended)  

# Pre-Build Steps
`node-gyp` must be installed and working on your machine.  
For information on how to install `node-gyp` see here: https://github.com/nodejs/node-gyp

## Windows
Windows users may have to run:
`npm install --global --production windows-build-tools` (this takes a few minutes)

## Install required packages
Simply run  
`npm install`  
And all required packages will be installed

# Build the Library
Run the command  
`npm run build` 

The Transaction Notary library will build and output into the `bin/eth-transaction-proxy/` directory.

# Testing
Consult the `test/README.md` for more information.
Run the following commands:
```
npm run install-test
npm run build-test
npm run test
```
