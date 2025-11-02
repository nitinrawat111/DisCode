import { SERVICE_NAME } from "../constants";
import { format, createLogger, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

// TODO: Add service name & uuids to logs
export const Logger = createLogger({
  transports: [
    // File transport
    new DailyRotateFile({
      dirname: "./logs/",
      level: process.env.FILE_LOG_LEVEL,
      filename: `${SERVICE_NAME}_%DATE%.log`,
      frequency: "24h",
      datePattern: "YYYY-MM-DD_HH-mm",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
      format: format.json(),
    }),

    // Console transport
    new transports.Console({
      level: process.env.CONSOLE_LOG_LEVEL,
      format: format.combine(format.colorize(), format.simple()),
    }),
  ],
});
