import { Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";
import { UserRoleEnum } from "../dtos/user.dto";
import { AuthenticatedRequest } from "../types/types";

export const verifyUserRole = (allowedRoles: UserRoleEnum[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      throw new ApiError(
        403,
        "You do not have permission to perform this action",
      );
    }

    next();
  };
};
