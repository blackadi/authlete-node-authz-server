import { NextFunction, Request, Response } from "express";
import { TokenService } from "../services/token.service";
import { LoginService } from "../services/login.service";
import session from "express-session";
import logger from "../utils/logger";
import { TokenFailRequest, TokenIssueRequest } from "@authlete/typescript-sdk/src/models";
import { Token } from "@authlete/typescript-sdk/dist/commonjs/sdk/token";

const tokenService = new TokenService();
const loginService = new LoginService();

export const tokenController = {
  handleToken: async (req: Request & { session: Partial<session.SessionData> }, res: Response, next: NextFunction) => {
    try {
      const result = await tokenService.process(req);

      switch (result.action) {
        case "BAD_REQUEST":
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-store");
          res.setHeader("Pragma", "no-cache");
          return res.status(400).send(result.responseContent ?? result);

        case "INVALID_CLIENT":
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-store");
          res.setHeader("Pragma", "no-cache");
          // If the client attempted HTTP Basic auth, return 401 with
          // WWW-Authenticate. Otherwise 400 is acceptable per RFC 6749.
          if (req.headers["authorization"]) {
            res.setHeader("WWW-Authenticate", 'Basic realm="Authlete"');
            return res.status(401).send(result.responseContent ?? result);
          }
          return res.status(400).send(result.responseContent ?? result);

        case "INTERNAL_SERVER_ERROR":
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-store");
          res.setHeader("Pragma", "no-cache");
          return res.status(500).send(result.responseContent ?? result);

        case "JWT_BEARER":
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-store");
          res.setHeader("Pragma", "no-cache");
          const data = {
            access_token: result.accessToken,
            token_type: "bearer",
            expires_in: result.accessTokenExpiresAt,
            scope: result.scopes,
          };
          return res.send(data);

        case "OK":
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-store");
          res.setHeader("Pragma", "no-cache");
          return res.status(200).send(result.responseContent);

        case "PASSWORD":
          // Resource Owner Password Credentials flow. Authlete returned
          // username/password and a ticket. Validate credentials then call
          // /auth/token/issue or /auth/token/fail accordingly.
          try {
            const username = result.username;
            const password = result.password;
            const ticket = result.ticket;

            if (!username || !password || !ticket) {
              res.setHeader("Content-Type", "application/json");
              res.setHeader("Cache-Control", "no-store");
              res.setHeader("Pragma", "no-cache");
              return res.status(400).send(result.responseContent ?? result);
            }

            const user = await loginService.validateUser(username, password);
            if (!user) {
              // invalid credentials -> call Authlete /auth/token/fail
              const reqFail: TokenFailRequest = { ticket, reason: "INVALID_RESOURCE_OWNER_CREDENTIALS" };
              const failResp = await tokenService.fail(reqFail);

              const { sendTokenFailResponse } = await import("./token-fail-response.handler");
              return sendTokenFailResponse(res, failResp);
              // res.setHeader("Content-Type", "application/json");
              // res.setHeader("Cache-Control", "no-store");
              // res.setHeader("Pragma", "no-cache");
              // return res.status(400).send(failResp.responseContent ?? failResp);
            }

            // valid credentials -> issue token using ticket and subject
            const issueReq: TokenIssueRequest = { ticket, subject: user.subject };
            const issueResp = await tokenService.issue(issueReq);

            const { sendTokenIssueResponse } = await import("./token-issue-response.handler");
            return sendTokenIssueResponse(res, issueResp);

            // res.setHeader("Content-Type", "application/json");
            // res.setHeader("Cache-Control", "no-cache, no-store");
            // res.setHeader("Pragma", "no-cache");
            // return res.status(200).send((issueResp).responseContent ?? issueResp);
          } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            req.logger?.error("Password grant handling failed", { message: err.message });
            logger.error("Password grant handling failed", { message: err.message });
            res.setHeader("Content-Type", "application/json");
            res.setHeader("Cache-Control", "no-store");
            res.setHeader("Pragma", "no-cache");
            return res.status(500).send({ error: "server_error", error_description: err.message });
          }

        case "TOKEN_EXCHANGE":
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-cache, no-store");
          res.setHeader("Pragma", "no-cache");
          return res.status(200).send(result.responseContent ?? result);

        default:
          req.logger?.error("Unknown token action", { action: result.action });
          logger.error("Unknown token action", { action: result.action });
          return res.status(500).send("Unknown token action");
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const log = req.logger || logger;
      log.error("Token Response Error", { message: error.message });
      return next(error);
    }
  }
};
