import { JWK, JWTPayload } from "jose";
import { userIdDto, UserRoleEnum } from "../dtos/user.dto";
import zod from 'zod';
import { Request } from "express";

export interface UserJWTPayload extends JWTPayload {
    userId: zod.infer<typeof userIdDto>,
    role: UserRoleEnum
}

// Export a typed Request interface for explicit use
export interface AuthenticatedRequest extends Request {
  user?: UserJWTPayload;
}