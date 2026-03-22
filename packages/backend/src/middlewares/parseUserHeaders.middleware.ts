import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { JwksServiceInstance } from "../services/jwks.service";
import { UserJWTPayload } from "../types";

export async function parseUserHeaders<
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
  // Extract Authorization header
  const authHeader = req.headers.authorization;

  if (
    typeof authHeader !== "string" ||
    authHeader.startsWith("Bearer ") === false
  ) {
    throw new ApiError(401, "Missing or invalid Authorization header");
  }

  // Extract JWT from "Bearer <token>"
  const token = authHeader.substring(7);

  // Verify JWT and extract userId
  const payload = await JwksServiceInstance.verifyJWT(token);

  // Attach userId to res.locals (role will be fetched by requireRoles middleware)
  res.locals = {
    userId: payload.userId,
  };

  next();
}
