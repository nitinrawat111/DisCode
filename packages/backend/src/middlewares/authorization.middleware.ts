import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { UserRole } from "../models/user.model";
import { UserJWTPayload } from "../types";
import { UserServiceInstance } from "../services/user.service";

export function requireRoles(allowedRoles: UserRole[]) {
  return async function <ReqParamsType, ResBodyType, ReqBodyType, ReqQueryType>(
    _req: Request<
      ReqParamsType,
      ResBodyType,
      ReqBodyType,
      ReqQueryType,
      UserJWTPayload
    >,
    res: Response<ResBodyType, UserJWTPayload>,
    next: NextFunction,
  ) {
    const userId = res.locals.userId;

    // Fetch the user's current role from database
    const userRole = await UserServiceInstance.getUserRole(userId);

    // Check if user's role is authorized
    if (allowedRoles.includes(userRole) === false) {
      throw new ApiError(
        403,
        "You do not have permission to access this resource",
      );
    }

    next();
  };
}
