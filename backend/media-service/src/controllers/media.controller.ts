import { NextFunction, Request, Response } from 'express';
import ApiResponse from '../utils/ApiResponse';
import { mediaServiceInstance } from '../services/media.service';

export class MediaController {
    async getSignedUploadUrl(req: Request, res: Response, next: NextFunction) {
        const signedUploadUrlResponse = await mediaServiceInstance.getSignedUploadUrl(req.body);
        res.status(200).json(new ApiResponse(200, 'Pre-signed upload URL generated successfully', signedUploadUrlResponse));
    }
}

export const mediaControllerInstance = new MediaController();