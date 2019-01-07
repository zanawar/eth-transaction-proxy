import Web3 = require("web3");

export function EncodeFunctionCall(web3: Web3, abi: any[], args: any, method: string): any {
  const argKeys = Object.keys(args);
  const argsCount = argKeys.length;

  // Find a function that matches the given name & argument count
  let methodDecls = abi.filter((json) => {
    return json.name === method && json.inputs.length === argsCount;
  });

  if (methodDecls.length === 0) {
    throw Error(`Error: Unable to find method named ${method} with argument count ${argsCount}.`);
  }

  if (methodDecls.length > 1) {
    // filter based on argument names
    methodDecls = methodDecls.filter((json: any) => {
      for (const argName of argKeys) {
        if (!json.inputs.some((input: any) => input.name === argName)) {
          return false;
        }
      }
      return true;
    });

    if (methodDecls.length > 1) {
      throw Error(
        `Error: Found more than one method named ${method} with argument names ${JSON.stringify(argKeys)}.`,
      );
    }
  }

  const methodDecl = methodDecls[0];

  if (methodDecl.stateMutability === "view") {
    throw new Error(
      `Error: The method you're forming a transaction does not mutate state, and is a view method. ` +
      `Please use the "submitView" functionality within the TransactionNotary instead.`,
    );
  }

  const values = argKeys.map((key) => args[key]);
  return web3.eth.abi.encodeFunctionCall(methodDecl, values);
}