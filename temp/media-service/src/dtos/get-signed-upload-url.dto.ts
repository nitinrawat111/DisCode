import zod from "zod";

export const contentTypeDto = zod.enum([
  "image/jpeg",
  "image/png",
  "text/plain",
  "text/markdown",
  "application/json",
  "application/javascript",
  "application/typescript",
  "application/python",
]);

export const folderNameDto = zod.enum([
  "users",
  "problems",
  "tests",
  "submissions",
]);

export const signedUploadUrlRequestDto = zod.object({
  contentType: contentTypeDto,
  folderName: folderNameDto,
});
