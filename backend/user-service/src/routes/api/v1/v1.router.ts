import { Router } from "express";
import { UserRouter } from "./user.router";

export const V1Router = Router();
V1Router.use("/users", UserRouter);
