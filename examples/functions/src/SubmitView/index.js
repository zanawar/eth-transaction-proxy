// REST API
// POST notary/view/submit
// body: {
//   to: string
//   from?: string
//   contractName: string
//   method: string
//   arguments: { any, any }
// }

"use strict"

var api = require("transaction-notary-api");
var ContractRepo = api.ContractRepo;

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

  try {
    transTo = getProperty(req, "to");
    transFrom = getProperty(req, "from", false);
    transContract = getProperty(req, "contractName");
    transMethod = getProperty(req, "method");
    transArguments = getProperty(req, "arguments");
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
    return notary.submitView({
      to: transTo,
      from: transFrom,
      contractName: transContract,
      method: transMethod,
      arguments: transArguments
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
