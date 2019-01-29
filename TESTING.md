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
Run the command:
```
test-docker
```
Docker will build and run the test container.