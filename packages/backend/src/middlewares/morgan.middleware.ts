import morgan from "morgan";
import { Logger } from "../utils/logger";

export const morganMiddleware = morgan("combined", {
  stream: {
    // Use winston logger as write stream
    write: (message) => Logger.http(message),
  },
});
