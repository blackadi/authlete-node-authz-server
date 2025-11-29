import { Request, Response } from "express";
import { AuthorizationService } from "../services/authorization.service";
import { appConfig } from "../config/app.config";

// Extend express-session types to include 'authorization'
import session from "express-session";

const authorizationService = new AuthorizationService();

export const authorizationController = {
  handleAuthorization: async (req: Request & { session: Partial<session.SessionData> }, res: Response) => {
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
            scopes: (req.query.scope || '').split(/\s+/).filter(Boolean) ?? [],
          };
          return res.redirect(appConfig.loginUrl);

        default:
          return res.status(500).send("Unknown authorization action");
      }
    } catch (err) {
      console.error(err);
      return res.status(500).send("Authorization processing failed.");
    }
  },
};
