import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { SignedUploadUrlResponse } from "../types/types";
import { signedUploadUrlRequestDto } from "../dtos/get-signed-upload-url.dto";

export class MediaService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB in bytes

  constructor() {
    const bucketName = process.env.AWS_BUCKET_NAME;
    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!bucketName) {
      throw new Error("AWS_BUCKET_NAME is not defined");
    }
    if (!region) {
      throw new Error("AWS_REGION is not defined");
    }
    if (!accessKeyId) {
      throw new Error("AWS_ACCESS_KEY_ID is not defined");
    }
    if (!secretAccessKey) {
      throw new Error("AWS_SECRET_ACCESS_KEY is not defined");
    }

    this.bucketName = bucketName;
    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async getSignedUploadUrl(
    request: z.infer<typeof signedUploadUrlRequestDto>,
  ): Promise<SignedUploadUrlResponse> {
    const { contentType, folderName } =
      signedUploadUrlRequestDto.parse(request);

    const key = `${folderName}/${uuidv4()}`;

    const { url, fields } = await createPresignedPost(this.s3Client, {
      Bucket: this.bucketName,
      Key: key,
      Conditions: [
        ["content-length-range", 1, MediaService.MAX_FILE_SIZE],
        ["eq", "$Content-Type", contentType],
      ],
      Fields: {
        "Content-Type": contentType,
      },
      Expires: 3600,
    });

    return { url, fields };
  }
}

export const mediaServiceInstance = new MediaService();
