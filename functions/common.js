const rpcUrl = process.env["RPC_URL"];
const blobConnectStr = process.env["BLOB_CONNECT_STR"];
const blobContainerName = process.env["BLOB_CONTAINER_NAME"];

module.exports.getProperty = (req, propertyName, required=true) => {

  if (req.body === undefined) {
    throw new Error("Error: no body found.");
  }

  var property = req.body[propertyName];

  if (required === true && property === undefined) {
    throw new Error(`Error: required request property "${propertyName}" not found.\n${req}`);
  }

  return property;
}

module.exports.createBlobABISource = (api, context) => {
  try {
    if (!blobConnectStr) {
      throw new Error("BLOB_CONNECT_STR not set.");
    }

    if (!blobContainerName) {
      throw new Error("BLOB_CONTAINER_NAME not set.");
    }

    return new api.BlobABISource(blobConnectStr, blobContainerName);
  } catch (e) {
    context.log(e.message);
    context.res = {
      status: 500,
      body: e.message
    };
    context.done();
  }
}

module.exports.createNotary = (api, contractRepo) => {
  return new Promise((resolve, reject) => {

    if (!rpcUrl) {
      reject(new Error("RPC_URL not set."));
    }

    // Create the TransactionNotary
    const notary = new api.TransactionNotary(contractRepo, rpcUrl, undefined, (connected, web3) => {
      connected.then((success) => {
        if (success) {
          resolve(notary);
        } else {
          reject(new Error("Failed to connect"));
        }
      })
      .catch((err) => {
        reject(err);
      });
    });
  });
}
