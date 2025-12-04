import { NextFunction, Request, Response } from "express";
import { IntrospectionService } from "../services/introspection.service";
import logger from "../utils/logger";

const introspectionService = new IntrospectionService();

export const introspectionController = {
  handleIntrospection: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await introspectionService.process(req);

      switch (result.action) {
        case "BAD_REQUEST":
          return res.status(400).send(result.responseContent);

        case "UNAUTHORIZED":
          return res.status(401).send(result.responseContent);

        case "INTERNAL_SERVER_ERROR":
          return res.status(500).send(result.responseContent);

        case "FORBIDDEN":
          res.setHeader("Content-Type", "application/json");
          return res.send(result.responseContent);

        case "OK":
          res.setHeader("Content-Type", "text/html");
          return res.send(result.responseContent);

        default:
          (req as any).logger?.error("Unknown introspection action", { action: result.action });
          logger.error("Unknown introspection action", { action: result.action });
          return res.status(500).send("Unknown introspection action");
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const log = (req as any).logger || logger;
      log.error("Introspection Response Error", { message: error.message });
      return next(error);
    }
  }
};
