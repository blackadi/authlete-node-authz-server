import { NextFunction, Request, Response } from "express";
import { Scope } from "../../node_modules/@authlete/typescript-sdk/dist/commonjs/models";
import { AuthorizationService } from "../services/authorization.service";
import { appConfig } from "../config/app.config";

// Extend express-session types to include 'authorization'
import session from "express-session";
import logger from "../utils/logger";

const authorizationService = new AuthorizationService();

export const authorizationController = {
  handleAuthorization: async (req: Request & { session: Partial<session.SessionData> }, res: Response, next: NextFunction) => {
    try {
        
      const result = await authorizationService.process(req);
        
      
      switch (result.action) {
        case "BAD_REQUEST":
          return res.status(400).send(result.responseContent);

        case "INTERNAL_SERVER_ERROR":
          return res.status(500).send(result.responseContent);

        case "LOCATION":
            res.setHeader("Location", result.responseContent??"");
          return res.redirect(result.responseContent??"");

        case "FORM":
          res.setHeader("Content-Type", "text/html;charset=UTF-8");
          res.setHeader("Cache-Control", "no-store");
          res.setHeader("Pragma", "no-cache");
          return res.status(200).send(result.responseContent);

        case "NO_INTERACTION":
          return res.redirect(result.responseContent??"");

        case "INTERACTION":
          // console.log("test", (req.query.scope || '').split(/\s+/).filter(Boolean));
          // Save parameters for login/consent steps
          req.session.authorization = {
            resultMessage: result.resultMessage ?? "",
            ticket: result.ticket ?? "",
            clientId: result.client?.clientId ?? 0,
            clientName: result.client?.clientName ?? "",
            scopes: ((typeof req.query.scope === 'string' ? req.query.scope : '').split(/\s+/).filter(Boolean).map(s => s as unknown as Scope)) ?? [],
          };
          // this will log the curl command session info which contains the ticket and user using connect.sid cookie
          req.logger?.info("TESTING MODE ONLY: curl session cookie", { cookie: req.cookies["connect.sid"] });
          return res.redirect(appConfig.loginUrl);

        default:
          return res.status(500).send("Unknown authorization action");
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const log = req.logger || logger;
      log.error("Authorization controller error", { message: error.message });
      return next(error);
    }
  },
};
