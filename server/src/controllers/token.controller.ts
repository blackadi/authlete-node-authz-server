import { NextFunction, Request, Response } from "express";
import { TokenService } from "../services/token.service";
import session from "express-session";
import logger from "../utils/logger";

const tokenService = new TokenService();

export const tokenController = {
  handleToken: async (req: Request & { session: Partial<session.SessionData> }, res: Response, next: NextFunction) => {
    try {
      const result = await tokenService.process(req);

      switch (result.action) {
        case "BAD_REQUEST":
          res.setHeader("Content-Type", "application/json");
          //console.log(req.session);
          return res.status(400).send(result);

        case "INVALID_CLIENT":
            res.setHeader("Content-Type", "application/json");
            //console.log(req.session);
          return res.status(401).send(result);

        case "INTERNAL_SERVER_ERROR":
            res.setHeader("Content-Type", "application/json");
            //console.log(req.session);
          return res.status(500).send(result);

        case "JWT_BEARER":
          res.setHeader("Content-Type", "application/json");
          const data = {
            access_token: result.accessToken,
            token_type: "bearer",
            expires_in: result.accessTokenExpiresAt,
            scope: result.scopes,
          };
          return res.send(data);

        case "OK":
          res.setHeader("Content-Type", "application/json");
          return res.send(result.responseContent);

        case "PASSWORD":
          res.setHeader("Content-Type", "application/json");
          return res.send(result.responseContent);

        case "TOKEN_EXCHANGE":
          res.setHeader("Content-Type", "application/json");
          return res.send(result.responseContent);

        default:
          (req as any).logger?.error("Unknown token action", { action: result.action });
          logger.error("Unknown token action", { action: result.action });
          return res.status(500).send("Unknown token action");
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const log = (req as any).logger || logger;
      log.error("Token Response Error", { message: error.message });
      return next(error);
    }
  }
};
