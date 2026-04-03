import { Router } from "express";
import { UserRouter } from "./user.router";
import { JWKSRouter } from "./jwks.router";
import { ProblemRouter } from "./problem.router";
import { SubmissionRouter } from "./submission.router";

export const V1Router: Router = Router();
V1Router.use("/users", UserRouter);
V1Router.use("/jwks", JWKSRouter);
V1Router.use("/problems", ProblemRouter);
V1Router.use("/submissions", SubmissionRouter);
