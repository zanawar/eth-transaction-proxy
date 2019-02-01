const api = require("eth-transaction-proxy");
import { TransactionProxy, AzureBlobContractSource } from "eth-transaction-proxy";

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

    return new AzureBlobContractSource(blobConnectStr, blobContainerName);
  } catch (e) {
    context.log(e.message);
    context.res = {
      status: 500,
      body: e.message
    };
    context.done();
  }
}

module.exports.createProxy = async (context) => {
  try {
    const AzureBlobContractSource = createAzureBlobContractSource(context);

    if (!rpcUrl) {
      reject(new Error("Configuration Error: RPC_URL not set."));
    }
    
    const proxy = new TransactionProxy({
      sources: [AzureBlobContractSource],
      rpcUrl: rpcUrl
    });

    return proxy;
  } catch (e) {
    context.res = {
      status: 500,
      body: e.message
    }
  }
}
