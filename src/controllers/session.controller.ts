import { Request, Response } from "express";
import { LoginService } from "../services/login.service";
import session from "express-session";
import { appConfig } from "../config/app.config";
import { AuthorizationService } from "../services/authorization.service";

const loginService = new LoginService();
const authorizationService = new AuthorizationService();

export const sessionController = {
  showLogin: (req: Request, res: Response) => {
    res.sendFile("login.html", { root: "src/views" });
  },

  handleLogin: async (req: Request & { session: Partial<session.SessionData> }, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send("Missing username or password.");
    }

    const user = await loginService.validateUser(username, password);
    if (!user) return res.status(401).send("Invalid username or password.");

    // Save user info in session
    req.session.user = username;

    // Must have ticket from OAuth2 authorization request
    const authz = req.session.authorization;
    if (!authz || !authz.ticket) {
      return res.status(400).send("Missing authorization context.");
    }

    // After login, show consent page
    return res.redirect(appConfig.consentUrl);
  },

  showConsent: (req: Request & { session: Partial<session.SessionData> }, res: Response) => {
    // Show the consent UI
    if (!req.session.user || !req.session.authorization) {
      return res.status(403).send("Unauthorized");
      //return res.redirect(appConfig.loginUrl);
    }
    res.sendFile("consent.html", { root: "src/views" });
  },

  handleConsent: async (req: Request & { session: Partial<session.SessionData> }, res: Response) => {
    if (!req.session.user || !req.session.authorization) {
      return res.status(403).send("Unauthorized");
      //return res.redirect(appConfig.loginUrl);
    }

    const decision = req.body.decision; // "approve" or "deny"
    const ticket = req.session.authorization.ticket;

    if (!ticket) {
      return res.status(400).send("Missing authorization ticket in session or No authorization in session.");
      // return res.redirect(appConfig.loginUrl);
    }

    try {
      let resultUrl = "";

      if (decision === "approve") {
        // Call Authlete /authorization/issue API
        console.log("Issuing authorization for ticket:", ticket); //testing only
        console.log("Issuing authorization for user:", req.session.user); //testing only
        const response = await authorizationService.issue(ticket, req.session.user);
        console.log("Authorization issue response:", response); //testing only
        resultUrl = response.responseContent ?? ""; // redirect URI with code/token
      } else {
        // Call Authlete /authorization/fail API
        const response = await authorizationService.fail(ticket );
        resultUrl = response.responseContent??""; // redirect URI with error
      }

      // Clear session authorization info
      delete req.session.authorization;

      // Redirect back to client with result
      return res.redirect(resultUrl);
      
    } catch (err) {
      console.error(err);
      return res.status(500).send("Consent processing failed.");
    }
  }
};
