import { NextFunction, Request, Response } from "express";
import ApiResponse from "../utils/ApiResponse.js";
import userService from "../services/user.service.js";
import jwtService from "../services/jwt.service.js";
import { ACCESS_TOKEN_EXPIRATION_TIME, COOKIE_OPTIONS } from "../constants.js";

// Namespace for user controllers
const userController = {
    register: async function (req: Request, res: Response, next: NextFunction) {
        await userService.register(req.body);
        res.send(201).json(new ApiResponse(200, "Succesfully registered"));
    },
    
    getUserProfile: async function (req: Request, res: Response, next: NextFunction) {
        const userProfile = await userService.getUserProfile(req.params.userId);
        res.status(200).json(new ApiResponse(200, "User Profile fetched successfully", userProfile));
    },

    login: async function name (req: Request, res: Response, next: NextFunction) {
        const payload = await userService.login(req.body);
        const accessToken = jwtService.getAccessToken(payload);
        res.cookie("accessToken", accessToken, {
            maxAge: ACCESS_TOKEN_EXPIRATION_TIME,
            ...COOKIE_OPTIONS
        });
        res.status(200).json(new ApiResponse(200, "Logged in successfully"));
    },

    getLoggedUserProfile: async function (req: Request, res: Response, next: NextFunction) {
        const userProfile = await userService.getUserProfile(req.user?.userId);
        res.status(200).json(new ApiResponse(200, "User Profile fecthed successfully", userProfile));
    },

    updateProfile: async function (req: Request, res: Response, next: NextFunction) {
        await userService.updateProfile(req.user?.userId, req.body);
        res.status(200).json(new ApiResponse(200, "User Profile updated successfully"));
    }
}

export default userController;