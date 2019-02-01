import Web3 = require("web3");

export function EncodeConstructorCall(web3: Web3, abi: any[], args: any, bytecode: string): any {
  const argKeys = Object.keys(args);
  const argValues: any[] = argKeys.map((key) => args[key]);

  const contract = new web3.eth.Contract(abi);
  const deployObject = contract.deploy({
    data: bytecode,
    arguments: argValues,
  });

  return deployObject.encodeABI();
}
