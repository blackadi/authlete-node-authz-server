import { Request, Response, NextFunction } from "express";
import { UserInfoService } from "../services/userinfo.service";
import logger from "../utils/logger";

const userInfoService = new UserInfoService();

export const userinfoController = {
  handleUserInfo: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await userInfoService.process(req);

      switch (result.action) {
        case "BAD_REQUEST":
          res.setHeader("WWW-Authenticate", result.responseContent??"");
          return res.status(400).send(result);

        case "UNAUTHORIZED":
            res.setHeader("WWW-Authenticate", result.responseContent??"");
          return res.status(401).send(result);

        case "INTERNAL_SERVER_ERROR":
          res.setHeader("WWW-Authenticate", result.responseContent??"");
          return res.status(500).send(result);

        case "OK":
          return res.send(result);

        case "FORBIDDEN":
          res.setHeader("WWW-Authenticate", result.responseContent??"");
          return res.status(403).send(result);

        default:
          (req as any).logger?.error("Unknown userinfo action", { action: result.action });
          logger.error("Unknown userinfo action", { action: result.action });
          return res.status(500).send("Unknown userinfo action");
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const log = (req as any).logger || logger;
      log.error("UserInfo Response Error", { message: error.message });
      return next(error);
    }
  }
};
