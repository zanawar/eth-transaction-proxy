const api = require("transaction-notary-api");

const rpcUrl = process.env["RPC_URL"];
const blobConnectStr = process.env["BLOB_CONNECT_STR"];
const blobContainerName = process.env["BLOB_CONTAINER_NAME"];

module.exports.getProperty = (req, propertyName, required=true) => {

  if (req.body === undefined) {
    throw new Error("No request body found.");
  }

  var property = req.body[propertyName];

  if (required === true && property === undefined) {
    throw new Error(`Required request property "${propertyName}" not found.`);
  }

  return property;
}

module.exports.createAzureBlobContractSource = (context) => {
  try {
    if (!blobConnectStr) {
      throw new Error("BLOB_CONNECT_STR not set.");
    }

    if (!blobContainerName) {
      throw new Error("BLOB_CONTAINER_NAME not set.");
    }

    return new api.AzureBlobContractSource(blobConnectStr, blobContainerName);
  } catch (e) {
    context.log(e.message);
    context.res = {
      status: 500,
      body: e.message
    };
    context.done();
  }
}

module.exports.createNotary = async (context) => {
  try {
    return await Promise((resolve, reject) => {

      let AzureBlobContractSource = createAzureBlobContractSource(context);
      if (AzureBlobContractSource === undefined) {
        return;
      }

      if (!rpcUrl) {
        reject(new Error("Configuration Error: RPC_URL not set."));
      }

      const contractRepo = new ContractRepo([
        AzureBlobContractSource
      ]);

      // Create the TransactionProxy
      const notary = new api.TransactionProxy(contractRepo, rpcUrl, undefined, (connected, web3) => {
        connected.then((success) => {
          if (success) {
            resolve(notary);
          } else {
            reject(new Error("Failed to create Notary"));
          }
        })
        .catch((err) => {
          reject(err);
        });
      });
    });
  } catch (e) {
    context.res = {
      status: 500,
      body: e.message
    }
  }
}
