import { Scope } from "@authlete/typescript-sdk/dist/commonjs/models";

// Extend express-session types to include 'authorization'
declare module "express-session" {
  interface SessionData {
    user?: string;
    authorization?: {
      resultMessage: string;
      ticket: string;
      clientId?: number;
      clientName?: string;
      scopes?: Array<Scope>;
    };
    secret?: string;
    saveUninitialized?: string;
    resave?: string;
  }
}