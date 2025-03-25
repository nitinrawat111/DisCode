import { NextFunction, Request, Response } from "express";
import ApiResponse from "../utils/ApiResponse";
import { userServiceInstance } from "../services/user.service";
import { jwksServiceInstance } from "../services/jwks.service";
import { AuthenticatedRequest } from "../types/types";

export class UserController {
    async register(req: Request, res: Response, next: NextFunction) {
        await userServiceInstance.register(req.body);
        res.status(201).json(new ApiResponse(201, "Succesfully registered"));
    };

    async login(req: Request, res: Response, next: NextFunction) {
        const payload = await userServiceInstance.login(req.body);
        const accessToken = await jwksServiceInstance.signJWT(payload);
        res.setHeader("Authorization", accessToken);
        res.status(200).json(new ApiResponse(200, "Logged in successfully"));
    };

    async getUserProfile(req: Request, res: Response, next: NextFunction) {
        const userId = parseInt(req.params.userId);
        const userProfile = await userServiceInstance.getUserProfile(userId);
        res.status(200).json(new ApiResponse(200, "User Profile fetched successfully", userProfile));
    };

    async getLoggedUserProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const userProfile = await userServiceInstance.getUserProfile(req.user?.userId);
        res.status(200).json(new ApiResponse(200, "User Profile fecthed successfully", userProfile));
    };

    async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        await userServiceInstance.updateProfile(req.user?.userId, req.body);
        res.status(200).json(new ApiResponse(200, "User Profile updated successfully"));
    };

    async getUserRole(req: Request, res: Response, next: NextFunction) {
        const userId = parseInt(req.params.userId);
        const role = await userServiceInstance.getUserRole(userId);
        res.status(200).json(new ApiResponse(200, "User role fetched successfully", { role: role }));
    }

    async changeRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const targetUserId = parseInt(req.params.userId);
        await userServiceInstance.changeRole(targetUserId, req.body, req.user?.userId);
        res.status(200).json(new ApiResponse(200, "Successfully changed user role"));
    }
}

export const userControllerInstance = new UserController();