import { MemoryContractSource, MemoryContract } from "eth-transaction-proxy";

export let ContractSources: MemoryContractSource[];
export let ContractNames: string[][];
export let AllContractNames: string[];
export let NumSources = 3;

export const createSources = (): void => {
  const numSources = NumSources;

  ContractSources = new Array<MemoryContractSource>(numSources);
  ContractNames = new Array<string[]>(numSources);
  AllContractNames = [];

  for (let i = 0; i < numSources; i++) {
    ContractNames[i] = [];

    const memoryContracts: MemoryContract[] = [];
    for (let j = 0; j < i + 1; j++) {
      const contractName = `Test-${i}-${j}`;
      ContractNames[i].push(contractName);
      AllContractNames.push(contractName);
      memoryContracts.push(new MemoryContract(contractName));
    }

    ContractSources[i] = new MemoryContractSource(memoryContracts);
  }
};
