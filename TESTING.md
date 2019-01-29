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

# Running Tests with Docker
Run the command:
```
npm run test-docker
```
Docker will build and run the test container.