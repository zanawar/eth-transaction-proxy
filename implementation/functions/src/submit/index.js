// REST API
// POST /submit
// body: {
//   rawSignedTransaction: string
// }

"use strict"

const common = require("../common");

module.exports = async (context, req) => {
  context.log('JavaScript HTTP trigger function processed a request.');

  // Get properties from the request body
  var rawTransaction;

  try {
    rawTransaction = common.getProperty(req, "rawSignedTransaction");
  } catch (e) {
    context.log(e.message);
    context.res = {
      status: 400,
      body: e.message
    };
    return;
  }

  let proxy = await common.createProxy(context);
  let receipt;
  try {
    receipt = await proxy.submitTransaction(rawTransaction);
  } catch (error) {
    context.res = {
      status: 400,
      body: e.message
    };
  }

  context.res = {
    status: 200,
    body: receipt
  };
}
