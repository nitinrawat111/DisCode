import { ApiError } from "../utils/ApiError";
import { UserIdDto, UserRoleDto } from "../dtos/user.dto";
import { NextFunction, Request, Response } from "express";
import { UserJWTPayload } from "../types";

export function parseUserHeaders<
  ReqParamsType,
  ResBodyType,
  ReqBodyType,
  ReqQueryType,
>(
  req: Request<
    ReqParamsType,
    ResBodyType,
    ReqBodyType,
    ReqQueryType,
    UserJWTPayload
  >,
  res: Response<ResBodyType, UserJWTPayload>,
  next: NextFunction,
) {
  // Extract headers
  const userId = req.headers["x-user-id"];
  const userRole = req.headers["x-user-role"];

  // Validate presence of headers
  // Headers will always be string (no matter the actual data they represent)
  // Reference: https://stackoverflow.com/questions/34152142/possible-types-of-a-http-header-value
  if (typeof userId !== "string") {
    throw new ApiError(401, "Missing x-user-id header");
  }

  if (typeof userRole !== "string") {
    throw new ApiError(401, "Missing x-user-role header");
  }

  // Validate userId
  const userIdResult = UserIdDto.safeParse(parseInt(userId));
  if (userIdResult.success === false) {
    throw new ApiError(400, "Invalid x-user-id header");
  }

  // Validate role using userRoleDto
  const roleResult = UserRoleDto.safeParse(userRole);
  if (roleResult.success === false) {
    throw new ApiError(400, "Invalid x-user-role header");
  }

  // Attach the parsed and validated user data to res.locals
  res.locals = {
    userId: userIdResult.data,
    role: roleResult.data,
  };
  next();
}
