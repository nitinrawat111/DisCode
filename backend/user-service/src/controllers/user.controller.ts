import { RequestHandler } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { UserServiceInstance } from "../services/user.service";
import { JwksServiceInstance } from "../services/jwks.service";
import {
  ChangeRoleRequest,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
} from "../dtos/user.dto";
import { UserProfile, UserRole } from "../types/db";
import { UserJWTPayload } from "../types";
import { UserIdParam } from "../routes/api/v1/user.router";

class UserController {
  register: RequestHandler<unknown, ApiResponse, RegisterRequest> = async (
    req,
    res,
  ) => {
    await UserServiceInstance.register(req.body);
    res.status(201).json(new ApiResponse(201, "Succesfully registered"));
  };

  login: RequestHandler<unknown, ApiResponse, LoginRequest> = async (
    req,
    res,
  ) => {
    const payload = await UserServiceInstance.login(req.body);
    const accessToken = await JwksServiceInstance.signJWT(payload);
    res.setHeader("Authorization", accessToken);
    res.status(200).json(new ApiResponse(200, "Logged in successfully"));
  };

  getUserProfile: RequestHandler<UserIdParam, ApiResponse<UserProfile>> =
    async (req, res) => {
      const userId = parseInt(req.params.userId);
      const userProfile = await UserServiceInstance.getUserProfile(userId);
      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "User Profile fetched successfully",
            userProfile,
          ),
        );
    };

  getLoggedUserProfile: RequestHandler<
    unknown,
    ApiResponse<UserProfile>,
    unknown,
    unknown,
    UserJWTPayload
  > = async (_req, res) => {
    const userProfile = await UserServiceInstance.getUserProfile(
      res.locals.userId,
    );
    res
      .status(200)
      .json(
        new ApiResponse(200, "User Profile fecthed successfully", userProfile),
      );
  };

  updateProfile: RequestHandler<
    unknown,
    ApiResponse,
    UpdateProfileRequest,
    unknown,
    UserJWTPayload
  > = async (req, res) => {
    await UserServiceInstance.updateProfile(res.locals.userId, req.body);
    res
      .status(200)
      .json(new ApiResponse(200, "User Profile updated successfully"));
  };

  getUserRole: RequestHandler<
    UserIdParam,
    ApiResponse<{ role: UserRole }>,
    unknown,
    unknown,
    UserJWTPayload
  > = async (req, res) => {
    const userId = parseInt(req.params.userId);
    const role = await UserServiceInstance.getUserRole(userId);
    res
      .status(200)
      .json(
        new ApiResponse(200, "User role fetched successfully", { role: role }),
      );
  };

  changeRole: RequestHandler<
    UserIdParam,
    ApiResponse<{ role: UserRole }>,
    ChangeRoleRequest,
    unknown,
    UserJWTPayload
  > = async (req, res) => {
    const targetUserId = parseInt(req.params.userId);
    await UserServiceInstance.changeRole(
      targetUserId,
      res.locals.userId,
      req.body,
    );
    res
      .status(200)
      .json(new ApiResponse(200, "Successfully changed user role"));
  };
}

export const UserControllerInstance = new UserController();
