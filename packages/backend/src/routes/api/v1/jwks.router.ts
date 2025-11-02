import { Router } from "express";
import { JWKSControllerInstance } from "../../../controllers/jwks.controller";

export const JWKSRouter = Router();
JWKSRouter.get("/", JWKSControllerInstance.getJwks);
