import { IContractSource } from "../../interfaces/IContractSource";
import { MemoryContract } from "./MemoryContract";

export { MemoryContract } from "./MemoryContract";

export class MemoryContractSource implements IContractSource {
    private contracts: MemoryContract[];

    constructor(contracts?: MemoryContract[]) {
        if (contracts) {
            this.contracts = contracts.slice();
        } else {
            this.contracts = [];
        }
    }

    public list(): Promise<MemoryContract[]> {
        return new Promise((resolve) => {
            resolve(this.contracts);
        });
    }

    public get(contractName: string): Promise<MemoryContract> {
        const contract = this.contracts.find((c: MemoryContract) => {
            return c.contractName === contractName;
        });

        return new Promise((resolve) => {
            resolve(contract);
        });
    }

    public push(contractName?: string, abi?: any): void {
        this.contracts.push(new MemoryContract(contractName, abi));
    }

    public clear(): void {
        this.contracts = [];
    }
}
