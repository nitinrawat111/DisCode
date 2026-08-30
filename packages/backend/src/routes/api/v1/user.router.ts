import { Router } from "express";
import { UserControllerInstance } from "../../../controllers/user.controller";
import { getBodyValidationMiddleware } from "../../../middlewares/validation.middleware";
import {
  LoginRequest,
  LoginRequestDto,
  RegisterRequest,
  RegisterRequestDto,
} from "../../../dtos/user.dto";
import { ApiResponse } from "../../../utils/ApiResponse";
import { parseUserHeaders } from "../../../middlewares/parseUserHeaders.middleware";
import { requireRoles } from "../../../middlewares/authorization.middleware";
import { UserProfile, UserRole } from "../../../models/user.model";
import { UserJWTPayload } from "../../../types";

export const UserRouter: Router = Router();
export type UserIdParam = {
  userId: string;
};

UserRouter.post<"/register", unknown, ApiResponse, RegisterRequest>(
  "/register",
  getBodyValidationMiddleware(RegisterRequestDto),
  UserControllerInstance.register,
);

UserRouter.post<"/login", unknown, ApiResponse, LoginRequest>(
  "/login",
  getBodyValidationMiddleware(LoginRequestDto),
  UserControllerInstance.login,
);

UserRouter.get<
  "/profile",
  unknown,
  ApiResponse<UserProfile>,
  unknown,
  unknown,
  UserJWTPayload
>("/profile", parseUserHeaders, UserControllerInstance.getLoggedUserProfile);

UserRouter.get("/profile/:userId", UserControllerInstance.getUserProfile);

UserRouter.patch(
  "/profile",
  parseUserHeaders,
  UserControllerInstance.updateProfile,
);

UserRouter.get("/role/:userId", UserControllerInstance.getUserRole);

UserRouter.put(
  "/role/:userId",
  parseUserHeaders,
  requireRoles([UserRole.Admin, UserRole.SuperAdmin]),
  UserControllerInstance.changeRole,
);
