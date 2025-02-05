import { NextFunction, Request, Response } from "express";
import jwtService from "../services/jwt.service.js";

export function verifyJWT (req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies?.accessToken;
    const payload = jwtService.verifyAccessToken(accessToken);
    req.user = payload;
    next();
}