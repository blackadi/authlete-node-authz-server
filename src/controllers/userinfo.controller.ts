import { Request, Response } from "express";
import { UserInfoService } from "../services/userinfo.service";

const userInfoService = new UserInfoService();

export const userinfoController = {
  handleUserInfo: async (req: Request, res: Response) => {
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
          console.error("Unknown action:", result.action);
          return res.status(500).send("Unknown userinfo action");
      }
    } catch (error) {
      console.error("UserInfo Error:", error);
      return res.status(500).send("Failed to process userinfo request.");
    }
  }
};
