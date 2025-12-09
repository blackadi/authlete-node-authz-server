import { NextFunction, Request, Response } from "express";
import { RevocationService } from "../services/revocation.service";
import logger from "../utils/logger";

const introspectionService = new RevocationService();
export class RevocationController {
  static async handle(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Extract POST form data
      const params = req.body;

      const result = await introspectionService.process(params);

      switch (result.action) {
        case "OK":
          // Token revoked successfully OR request was valid.
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-store");
          res.setHeader("Pragma", "no-cache");
          res.status(200).send(result.responseContent ?? "");
          return;

        case "BAD_REQUEST":
          // Invalid request e.g., malformed token / unsupported token type
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-store");
          res.setHeader("Pragma", "no-cache");
          res.status(400).send(result.responseContent ?? "");
          return;

        case "INVALID_CLIENT":
          // Client authentication failed
          res.setHeader("WWW-Authenticate", result.responseContent ?? "");
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-store");
          res.setHeader("Pragma", "no-cache");
          res.status(401).send(result.responseContent ?? "");
          return;

        case "INTERNAL_SERVER_ERROR":
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-store");
          res.setHeader("Pragma", "no-cache");
          res.status(500).send(result.responseContent ?? "");
          return;

        default:
          // Authlete never returns undefined actions unless misconfigured
          res.status(500).send(result);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error("Revocation Response Error", { message: error.message });
      return next(error);
    }
  }
}
