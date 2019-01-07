# Transaction Notary Testing
The Transaction Notary tests require a separate (but similar) install and build pipeline.

**Run all commands from the projects root directory**  
(*Not* from `./test`)

# Prerequisites 
Testing prerequisites are the same as the library.

## Install required packages
From the root directory, run the command:  
`npm run install-test`

# Build
From the root directory, run the command:  
`npm run build-test`  
The Transaction Notary library tests will build and output into the `bin/tests/` directory.

# Running Tests
From the root directory, run the command:  
`npm run tests`

## asdf

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
