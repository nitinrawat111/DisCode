import {
  BlobSASPermissions,
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

export const AzureBlobContainers = {
  ProblemMarkdowns: "problem-markdowns",
} as const;
export type AzureBlobContainer =
  (typeof AzureBlobContainers)[keyof typeof AzureBlobContainers];

export class MediaService {
  private blobServiceClient: BlobServiceClient;

  constructor() {
    const sharedCredential = new StorageSharedKeyCredential(
      process.env.AZURE_ACCOUNT_NAME,
      process.env.AZURE_ACCOUNT_KEY,
    );

    // Reference: https://www.npmjs.com/package/@azure/storage-blob
    this.blobServiceClient = new BlobServiceClient(
      `https://${process.env.AZURE_ACCOUNT_NAME}.blob.core.windows.net`,
      sharedCredential,
    );
  }

  /**
   * Uploads a file to Azure Blob Storage
   * Throws ApiError if the blob already exists (to prevent overwriting) or if upload fails
   */
  async uploadFile(
    containerName: AzureBlobContainer,
    blobPath: string,
    fileBuffer: Buffer,
    contentType: string,
  ): Promise<void> {
    const containerClient =
      this.blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
      blobHTTPHeaders: { blobContentType: contentType },
      conditions: {
        // If-None-Match condition to prevent overwriting existing blobs
        // Reference: https://learn.microsoft.com/en-us/rest/api/storageservices/specifying-conditional-headers-for-blob-service-operations#Subheading1
        ifNoneMatch: "*",
      }
    });
  }

  /**
   * Generates a presigned (SAS) download URL for a file
   * Throws ApiError if container doesn't exist or URL generation fails
   * @param expiresIn Expiration time in seconds (default: 3600 seconds = 1 hour)
   */
  async getPresignedDownloadUrl(
    containerName: AzureBlobContainer,
    blobPath: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    const containerClient =
      this.blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    const downloadUrl = await blockBlobClient.generateSasUrl({
      permissions: BlobSASPermissions.from({
        read: true,
      }),
      expiresOn: new Date(Date.now() + expiresIn * 1000),
    });

    return downloadUrl;
  }
}

export const MediaServiceInstance = new MediaService();
