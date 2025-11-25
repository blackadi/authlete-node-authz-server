import dotenv from "dotenv";

const session = require("express-session");

dotenv.config();

const defaultCookie: any = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 1000 * 60 * 30, // 30 minutes
};
const defaultOptions: any = {
  secret: process.env.SESSION_SECRET || "change_this_secret",
  resave: false,
  saveUninitialized: false,
  cookie: defaultCookie,
};

export const sessionMiddleware = (opts?: any) => {
  const merged: any = {
    ...defaultOptions,
    ...(opts || {}),
    cookie: {
      ...(defaultCookie || {}),
      ...((opts && opts.cookie) || {}),
    },
  };

  return session(merged);
};
