import * as express from "express";
import swaggerRouter from "./swagger.router";
import submissionRouter from "./submission.router";

const router = express.Router();
router.use("/submissions", submissionRouter);
router.use("/api-docs", swaggerRouter);

export default router;
