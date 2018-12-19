// REST API
// POST notary/transaction/submit
// body: {
//   rawSignedTransaction: string
// }

"use strict"

var api = require("transaction-notary-api");
var ContractRepo = api.ContractRepo;

const common = require("../common");
const getProperty = common.getProperty;
const createNotary = common.createNotary;

module.exports = async (context, req) => {
  context.log('JavaScript HTTP trigger function processed a request.');

  // Get properties from the request body
  var rawTransaction;

  try {
    rawTransaction = getProperty(req, "rawSignedTransaction");
  } catch (e) {
    context.log(e.message);
    context.res = {
      status: 400,
      body: e.message
    };
    return;
  }

  const contractRepo = new ContractRepo([]);

  // create the notary
  return createNotary(api, contractRepo).then((notary) => {
    return notary.submitTransaction(
      rawTransaction
    )
    .then((transactionReceipt) => {
      // success, transaction created
      context.res = {
        status: 202,
        body: transactionReceipt
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
}
