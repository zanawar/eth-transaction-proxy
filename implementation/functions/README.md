# Transaction Proxy Azure Functions
A simple implementation of the Transaction Proxy as an Azure Function, exposing functionality through a Web API.

## Docker Examples
Two Docker compose scripts are provided to demonstrate usage against a ganache instance.  

`FunctionsLocalBlob` uses a blob emulator as contract storage. 

`FunctionsRemoteBlob` uses an actual Azure Blob Storage Account to run.

In either case, you will have to upload compiled smart contracts to the blob storage for the Transaction Proxy to create transaction payloads or view any smart contract view methods. 

**Note:** The example Docker functions will use the *local* eth-transaction-proxy source code and build the library inside the docker for usage. In production scenarios it's advised to modify the Dockerfile to use the npm published version (unless you require your own custom version.)

### Running the Docker containers
```
cd ./docker/compose/FunctionsLocalBlob
docker-compose up --build -V
```

### Accessing the Transaction Proxy
The transaction proxy Web API will by default be exposed to `localhost:8585`

You can access it's endpoints as follows:
```
POST http://localhost:8585/view
POST http://localhost:8585/create
POST http://localhost:8585/submit
```