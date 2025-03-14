import { NextFunction, Request, Response } from "express";
import ApiResponse from "../utils/ApiResponse";
import { userServiceInstance } from "../services/user.service";
import { jwksServiceInstance } from "../services/jwks.service";
import { ACCESS_TOKEN_EXPIRATION_TIME, COOKIE_OPTIONS } from "../constants";
import { userIdDto } from "../dtos/users.dto";
import { AuthenticatedRequest } from "types/types";

export class UserController {
    async register(req: Request, res: Response, next: NextFunction) {
        await userServiceInstance.register(req.body);
        res.status(201).json(new ApiResponse(201, "Succesfully registered"));
    }; 
    
    async login(req: Request, res: Response, next: NextFunction) {
        const payload = await userServiceInstance.login(req.body);
        const accessToken = await jwksServiceInstance.signJWT(payload);
        res.cookie("accessToken", accessToken, {
            maxAge: ACCESS_TOKEN_EXPIRATION_TIME,
            ...COOKIE_OPTIONS
        });
        res.status(200).json(new ApiResponse(200, "Logged in successfully"));
    };

    async getCurrentUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const userProfile = await userServiceInstance.getUserProfile(req.user?.userId);
        res.status(200).json(new ApiResponse(200, "Current User profile fetched succesfully", userProfile));
    }
    
    async getUserProfile(req: Request, res: Response, next: NextFunction) {
        const userId = parseInt(req.params.userId);
        userIdDto.parse(userId);
        const userProfile = await userServiceInstance.getUserProfile(userId);
        res.status(200).json(new ApiResponse(200, "User Profile fetched successfully", userProfile));
    };

    async getLoggedUserProfile (req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const userProfile = await userServiceInstance.getUserProfile(req.user?.userId);
        res.status(200).json(new ApiResponse(200, "User Profile fecthed successfully", userProfile));
    };

    async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        await userServiceInstance.updateProfile(req.user?.userId, req.body);
        res.status(200).json(new ApiResponse(200, "User Profile updated successfully"));
    };
}

export const userControllerInstance = new UserController();