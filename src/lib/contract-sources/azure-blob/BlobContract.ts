export class BlobContract {
    public readonly containerName: string;
    public readonly blobName: string;
    public readonly blobData: string;

    // @TODO: Refactor
    constructor(containerName: string, blobName: string, blobData: string) {
        this.containerName = containerName;
        this.blobName = blobName;
        this.blobData = blobData;
    }

    public getContractName(): string {
        return this.blobName.replace(".json", "");
    }
}
