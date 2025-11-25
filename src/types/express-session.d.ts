// Extend express-session types to include 'authorization'
declare module "express-session" {
  interface SessionData {
    user?: string;
    authorization?: {
      resultMessage: string;
      ticket: string;
    };
    secret?: string;
    saveUninitialized?: string;
    resave?: string;
  }
}