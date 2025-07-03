import cors from "cors";
import { Logger } from "./utils/logger";
import { ApiError } from "./utils/ApiError";
import { ApiResponse } from "./utils/ApiResponse";
import { V1Router } from "./routes/api/v1/v1.router";
import { morganMiddleware } from "./middlewares/morgan.middleware";
import express, { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod/v4";
import { JwksServiceInstance } from "./services/jwks.service";

////////////////////////////////////////////////////////////
// Express App Initialization
// Exporting for testing
////////////////////////////////////////////////////////////
export const app = express();

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
app.use("/api/v1", V1Router);

////////////////////////////////////////////////////////////
// Error Handler
////////////////////////////////////////////////////////////
app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent === true) {
    next(err);
    return;
  }

  if (err instanceof ApiError) {
    // Handle Custom thrown ApiErrors
    res
      .status(err.statusCode)
      .json(
        new ApiResponse(err.statusCode, err.message, undefined, err.errors),
      );
    Logger.debug(err.stack);
  } else if (err instanceof ZodError) {
    // Handle Zod Validation Errors
    // Send formatted zod errors are response
    res
      .status(400)
      .json(
        new ApiResponse(400, "Invalid Request", undefined, z.treeifyError(err)),
      );
    Logger.debug(err.stack);
  } else {
    // In case of any other error
    res.status(500).json(new ApiResponse(500, "Internal Server Error!"));
    Logger.error(err.stack);
  }
});

////////////////////////////////////////////////////////////
// Server Initialization
////////////////////////////////////////////////////////////
const PORT = parseInt(process.env.PORT);
async function init() {
  await JwksServiceInstance.waitForInit();
  app.listen(PORT, () => {
    Logger.info(`Server started on PORT: ${PORT}`);
  });
}
init();
