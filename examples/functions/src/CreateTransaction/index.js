// REST API
// POST notary/transaction/create
// body: {
//   from: string
//   to: string
//   contractName: string
//   method: string
//   arguments: { any, any }
//   extraGas?: number
// }

"use strict"

const api = require("transaction-notary-api");
const ContractRepo = api.ContractRepo;

const common = require("../common");
const getProperty = common.getProperty;
const createNotary = common.createNotary;
const createAzureBlobContractSource = common.createAzureBlobContractSource;

module.exports = async (context, req) => {
  context.log('JavaScript HTTP trigger function processed a request.');

  // Get properties from the request body
  var transTo;
  var transFrom;
  var transContract;
  var transMethod;
  var transArguments;
  var transExtraGas;

  try {
    transTo = getProperty(req, "to");
    transFrom = getProperty(req, "from");
    transContract = getProperty(req, "contractName");
    transMethod = getProperty(req, "method");
    transArguments = getProperty(req, "arguments");
    transExtraGas = getProperty(req, "extraGas", false);
  } catch (e) {
    context.log(e.message);
    context.res = {
      status: 400,
      body: e.message
    };
    return;
  }

  // try to create the folder abi source
  let AzureBlobContractSource = createAzureBlobContractSource(api, context);

  if (AzureBlobContractSource === undefined) {
    return;
  }

  const contractRepo = new ContractRepo([
    AzureBlobContractSource
  ]);

  // create the notary
  return createNotary(api, contractRepo).then((notary) => {
    // create the transaction
    return notary.createTransaction({
      to: transTo,
      from: transFrom,
      contractName: transContract,
      method: transMethod,
      arguments: transArguments,
      extraGas: transExtraGas
    })
    .then((transaction) => {
      // success
      context.res = {
        status: 200,
        body: transaction
      };
    })
    .catch((e) => {
      // internal error
      context.res = {
        status: 500,
        body: e.message
      };
    });
  })
  .catch((e) => {
    // failed to connect
    context.res = {
      status: 503,
      body: e.message
    };
  });
};
