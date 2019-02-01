const lib = require("eth-transaction-proxy");
const TransactionProxy = lib.TransactionProxy;
const AzureBlobContractSource = lib.AzureBlobContractSource;

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

function createAzureBlobContractSource(context) {
  try {
    if (!blobConnectStr) {
      throw new Error("BLOB_CONNECT_STR not set.");
    }

    if (!blobContainerName) {
      throw new Error("BLOB_CONTAINER_NAME not set.");
    }

    return new AzureBlobContractSource(blobConnectStr, blobContainerName);
  } catch (e) {
    context.log("Failed to create Azure Blob Source: " + e.message);
  }

  return null;
}

module.exports.createProxy = (context) => {
  const sources = [];

  const blobContracts = createAzureBlobContractSource(context);
  if (blobContracts != null) {
    sources.push(blobContracts);
  }

  if (rpcUrl == null) {
    context.log("Configuration Error: RPC_URL not set.")
    context.res = {
      status: 500,
      body: "Configuration Error."
    };
    context.done();
    return null;
  }

  const proxy = new TransactionProxy({
    sources: sources,
    rpcUrl: rpcUrl
  });

  return proxy;
}
