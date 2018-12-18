import {
  ContractRepo,
  FolderABISource,
  BlobABISource,
  TransactionNotary
} from "../lib";
import Web3 = require("web3");
const web3 = new Web3();
const privateKey = "0x348ce564d427a3311b6536bbcff9390d69395b06ed6c486954e971d960fe8709";

async function main()
{
  // Create a Contract Repository that points to our ABI locations
  const contracts = new ContractRepo([
    new FolderABISource("./contracts"),
    new BlobABISource("CONNECTION_STR", "CONTAINER_NAME")
  ]);

  // Initialize our Transaction Notary with an RPC endpoint and a Contract Repository
  const notary = new TransactionNotary(
    contracts,
    "https://localhost:8080",
    undefined,
    (connected: Promise<boolean>, web3: Web3) => {
      connected.then((success) => {
        if (success) {
          console.log("connected!");
        } else {
          console.log("couldn't connect... find logs within the web3 instance...");
        }
      })
      .catch((err) => console.log(err));
  });

  // Create a transaction
  const transaction = await notary.createTransaction({
    to: "0x0000000000000000000000000000000000000000",
    from: "0x0000000000000000000000000000000000000000",
    contractName: "Catalog",
    method: "addItem",
    arguments: {
      name: "Something",
      id: 12345,
      receiver: "0x0000000000000000000000000000000000000001"
    }
  });

  // Sign it
  const signed = await web3.eth.accounts.signTransaction(transaction, privateKey);

  // Submit it to the chain
  const receipt = await notary.submitTransaction(signed.rawTransaction);

  console.log(receipt);

  // [Extra]
  // For fast retrieval, but low memory footprint
  await contracts.cacheMetadata();

  // For fast retrieval, but loads everything into memory
  await contracts.cacheABIJson();

  // If neither of these are called, when you request an ABI,
  // a "cold search" is done to find it. This could be extremely
  // slow or extremely fast depending on the querying abilities
  // of the location itself (i.e. indexed DB vs file system).
}

main();
