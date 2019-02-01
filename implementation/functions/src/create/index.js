// REST API
// POST /create
// body: {
//   from: string
//   to: string
//   contractName: string
//   method: string
//   arguments: { any, any }
//   extraGas?: number
// }

"use strict"

const common = require("../common");

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
    transTo = common.getProperty(req, "to");
    transFrom = common.getProperty(req, "from");
    transContract = common.getProperty(req, "contractName");
    transMethod = common.getProperty(req, "method");
    transArguments = common.getProperty(req, "arguments");
    transExtraGas = common.getProperty(req, "extraGas", false);

    if (transArguments == null) {
      transArguments = {};
    }
  } catch (e) {
    context.log(e.message);
    context.res = {
      status: 400,
      body: e.message
    };
    return;
  }

  let proxy = common.createProxy(context);
  if (!proxy) {
    return;
  }

  let transaction;
  try {
    transaction = await proxy.create({
      to: transTo,
      from: transFrom,
      contractName: transContract,
      method: transMethod,
      arguments: transArguments,
      extraGas: transExtraGas
    });
  } catch (e) {
    context.res = {
      status: 400,
      body: e.message
    };
    return;
  }

  context.res = {
    status: 200,
    body: transaction
  };
};
