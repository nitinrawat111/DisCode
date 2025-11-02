import { RequestHandler } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { JwksServiceInstance } from "../services/jwks.service";
import { JSONWebKeySet } from "jose";

class JWKSController {
  getJwks: RequestHandler<unknown, ApiResponse<JSONWebKeySet>> = async (
    _req,
    res,
  ) => {
    const jwks = JwksServiceInstance.getJwks();
    res
      .status(200)
      .json(new ApiResponse(200, "JWKS fetched successfully", jwks));
  };
}

export const JWKSControllerInstance = new JWKSController();
