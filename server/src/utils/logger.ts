import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const isDev = process.env.NODE_ENV !== "production";

const consoleTransport = new transports.Console({
  format: isDev
    ? format.combine(format.colorize(), format.simple())
    : format.combine(format.timestamp(), format.json()),
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
  format: format.combine(format.timestamp(), format.errors({ stack: true })),
  transports: [
    consoleTransport,
    new DailyRotateFile({
      filename: "logs/app-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
      level: "info",
      zippedArchive: true,
    }),
    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "30d",
      level: "error",
      zippedArchive: true,
    }),
  ],
  exitOnError: false,
});

export default logger;

