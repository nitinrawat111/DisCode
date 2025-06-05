import { Response, NextFunction } from 'express';
import { userIdDto, userRoleDto, UserRoleEnum } from '../dtos/user.dto';
import ApiError from '../utils/ApiError';
import { AuthenticatedRequest } from '../types/types';

export const parseUserHeaders = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Extract headers
    const userId = req.headers['x-user-id'];
    const role = req.headers['x-user-role'] as string;

    // Validate presence of headers
    if (!userId || !role) {
        throw new ApiError(401, "Missing x-user-id and x-user-role headers");
    }

    // Validate userId
    const numericUserId  = parseInt(userId as string);
    const userIdResult = userIdDto.safeParse(numericUserId);
    if (!userIdResult.success) {
        throw new ApiError(400, "Invalid x-user-id header");
    }

    // Validate role using userRoleDto
    const roleResult = userRoleDto.safeParse(role);
    if (!roleResult.success) {
        throw new ApiError(400, "Invalid x-user-role header");
    }

    // Attach the parsed and validated user data to req.user
    req.user = {
        userId: userIdResult.data,
        role: roleResult.data as UserRoleEnum,
    };

    next();
};