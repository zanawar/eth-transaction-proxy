import { IContract } from "../../interfaces/IContract";

export class MemoryContract implements IContract {
    public contractName : string;
    public contractAbi : any;

    constructor(contractName?: string, abi?: any) {
        if (!contractName && !abi) {
            throw Error("Either 'contractName' or 'abi' must be passed in.");
        }

        if (contractName) {
            this.contractName = contractName;
            this.contractAbi = abi;   

            if (!this.contractAbi) {
                this.contractAbi = { contractName: contractName }
            }
        } else {
            this.contractAbi = abi; 
            if (this.contractAbi.contractName === undefined) {
                throw new Error("Contract abi must contain a 'contractName' property.");
            }
            this.contractName = this.contractAbi.contractName;
        }      
    }

    public abi(): Promise<any> {
        return new Promise((resolve) => {
            resolve(this.contractAbi);
        });
    }

    public name(): string {
        return this.contractName;
    }
}