# Introduction  
The TransactionNotary aims to abstract away smart contract interactions to help simplify business logic. It facilitates:  
* Transaction Payload Creation (Given: Contract Name, Method Name, Arguments)  
* Signed Transaction Submission  
* Smart Contract Data Viewing  

# Project Structure  
- api: The underlying logic for the notary. See api/examples/example.ts for usage instructions.  
- functions: The serverless implementation of the TransactionNotary.  
- service: The persistant service implementation of the TransactionNotary.  
- test: Tests for all aspects of the project.  
- scripts: Auxilary scripts required by the project.  

# Installation  
## Prerequisites  
npm@latest (tested w/ 6.4.1)  
node@latest (tested w/ v8.9.4)  
python 3.6.5  
Docker + Docker Compose  

## Linux / Mac  
`cd TransactionNotary`  
`npm i`  

## Windows  
Run PowerShell as Administrator (CMD might work too)  
`npm install --global --production windows-build-tools` (this takes a few minutes)  
`cd TransactionNotary`  
`npm i`  

# Build  
`npm run build`  

# Test  
All of the tests except `test/api.blob` and `test/function` can be run without docker.  

NOTE: This doesn't work on Windows. The tests create and modify files and folders, which results in node throwing EPERM exceptions. I can't for the life of me figure out how to get around this, I've tried: running user directories, running as admin, turning off AV, changing file/folder flags to allow for read & write.  

## Inside Docker  
`npm run test`  

## Outside Docker  
### 1  
`cd docker/compose/FunctionsLocalBlob`  
setup .env file (see .env-example)  
`docker-compose up --build`  

This stands up 3 containers:  
Ganache - Blockchain  
Blob - Azure Blob Emulator  
Functions - Azure Functions Host running ./functions  

### 2  
In another terminal from root directory:  
`cd test`  
`set NOTARY_URL=http://localhost:8585`  
`set RPC_URL=http://localhost:8545`  
`set BLOB_CONTAINER_NAME=contracts`  
`set BLOB_CONNECT_STR=DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://localhost:10000/devstoreaccount1;`  

NOTE: This is assuming the notary is on port `8585`, ganache is on `8545`, and blob is on `10000`.  
