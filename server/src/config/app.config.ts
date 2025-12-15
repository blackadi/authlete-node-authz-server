import { configDotenv } from "dotenv";
configDotenv();

export const appConfig = {
  loginUrl: "/api/session/login",
  consentUrl: "/api/session/consent",
};

export const server = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || "development", // "development" | "production"
  morganFormat: process.env.MORGAN_FORMAT || "combined",
  sessionSecret: process.env.SESSION_SECRET || "P@$sW0rd&Ch@ng3",
  logLevel:
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV !== "production" ? "debug" : "info"),
};
