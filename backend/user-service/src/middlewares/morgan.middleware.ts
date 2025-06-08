import * as morgan from "morgan";
import logger from "../utils/logger";

const logFormat =
  process.env.NODE_ENV === "dev"
    ? ":method :url :status :response-time ms - :res[content-length] bytes"
    : ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';

const morganMiddleware = morgan(logFormat, {
  stream: {
    // Use winston logger as write stream
    write: (message) => logger.http(message),
  },
});

export default morganMiddleware;
