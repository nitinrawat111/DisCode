import * as cors from "cors";
import logger from "./utils/logger";
import ApiError from "./utils/ApiError";
import ApiResponse from "./utils/ApiResponse";
import v1Router from "./routes/api/v1/v1.router";
import morganMiddleware from "./middlewares/morgan.middleware";
import { NextFunction, Request, Response } from "express";
import * as express from "express";
import { dbInit } from "./config/db";
import { ZodError } from "zod";

////////////////////////////////////////////////////////////
// Express App Initialization
////////////////////////////////////////////////////////////
const app = express();

////////////////////////////////////////////////////////////
// Middlewares
////////////////////////////////////////////////////////////
app.use(express.json());
app.use(morganMiddleware);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true, // To allow cookies
  }),
);

////////////////////////////////////////////////////////////
// Routes
////////////////////////////////////////////////////////////
app.use("/api/v1", v1Router);

////////////////////////////////////////////////////////////
// Error Handler
////////////////////////////////////////////////////////////
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    next(err);
  }

  if (err instanceof ApiError) {
    // Handle Custom thrown ApiErrors
    res
      .status(err.statusCode)
      .json(
        new ApiResponse(err.statusCode, err.message, undefined, err.errors),
      );
    logger.debug(err.stack);
  } else if (err instanceof ZodError) {
    // Handle Zod Validation Errors
    res
      .status(400)
      .json(new ApiResponse(400, "Invalid Request", undefined, err.format()));
    logger.debug(err.stack);
  } else {
    // In case of any other error
    res.status(500).json(new ApiResponse(500, "Internal Server Error!"));
    logger.error(err.stack);
  }
});

////////////////////////////////////////////////////////////
// Server Initialization
////////////////////////////////////////////////////////////
const PORT = process.env.PORT;
async function init() {
  await dbInit();
  app.listen(PORT, () => {
    logger.info(`Server started on PORT: ${PORT}`);
  });
}
init();

////////////////////////////////////////////////////////////
// Exporting Express app for testing
////////////////////////////////////////////////////////////
export default app;
