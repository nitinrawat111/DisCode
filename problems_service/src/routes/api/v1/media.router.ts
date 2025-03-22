import * as express from 'express';
import { mediaControllerInstance } from '../../../controllers/media.controller';
import * as asyncHandler from 'express-async-handler';
import { parseUserHeaders } from '../../../middlewares/parseUserHeaders.middleware'; // Optional, for auth

const router = express.Router();

/**
 * @swagger
 * /media/upload-url:
 *   post:
 *     summary: "Generate a pre-signed S3 POST URL for media upload"
 *     tags: [Media]
 *     consumes:
 *       - "application/json"
 *     produces:
 *       - "application/json"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contentType:
 *                 type: string
 *                 enum: ["image/jpeg", "image/png", "image/gif", "image/webp"]
 *                 description: "The MIME type of the media to upload"
 *             required:
 *               - contentType
 *     responses:
 *       200:
 *         description: "Pre-signed URL generated successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Pre-signed upload URL generated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       example: "https://test-bucket.s3.amazonaws.com/"
 *                     fields:
 *                       type: object
 *                       additionalProperties:
 *                         type: string
 *                       example:
 *                         key: "uploads/123e4567-e89b-12d3-a456-426614174000"
 *                         AWSAccessKeyId: "test-access-key"
 *                         Policy: "mock-policy"
 *                         "X-Amz-Signature": "mock-signature"
 *                         "Content-Type": "image/jpeg"
 *       400:
 *         description: "Invalid content type"
 */
router.post('/upload-url', asyncHandler(mediaControllerInstance.getSignedUploadUrl));

export default router;