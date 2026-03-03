import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { UserRole } from "../models/user.model";
import { UserJWTPayload } from "../types";

export function requireRoles(allowedRoles: UserRole[]) {
  return function <ReqParamsType, ResBodyType, ReqBodyType, ReqQueryType>(
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
    const userRole = res.locals.role;

    if (allowedRoles.includes(userRole) === false) {
      throw new ApiError(
        403,
        "You do not have permission to access this resource",
      );
    }

    next();
  };
}
