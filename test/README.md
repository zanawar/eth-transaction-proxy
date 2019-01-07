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

# Blob Tests
To test the Azure Blob contract source, either an Azure Storage Account or Azure Storage Emulator must be available.  
Set the environment variable `TEST_BLOB = 1` and `AZURE_STORAGE_CONNECTION_STRING` set to an Azure connection string.

# Running Tests From Docker
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
