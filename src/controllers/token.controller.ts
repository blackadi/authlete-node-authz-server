import { Request, Response } from "express";
import { TokenService } from "../services/token.service";

const tokenService = new TokenService();

let error;
export const tokenController = {
  handleToken: async (req: Request, res: Response) => {
    try {
      const result = await tokenService.process(req);

      switch (result.action) {
        case "BAD_REQUEST":
          res.setHeader("Content-Type", "application/json");
          error = tokenService.fail(result.ticket ?? "");
          return res.status(400).send(result.responseContent + (error ? `\nError from Authlete fail endpoint: ${error}` : ""));

        case "INVALID_CLIENT":
            res.setHeader("Content-Type", "application/json");
            error = tokenService.fail(result.ticket ?? "");
          return res.status(401).send(result.responseContent + (error ? `\nError from Authlete fail endpoint: ${error}` : ""));

        case "INTERNAL_SERVER_ERROR":
            res.setHeader("Content-Type", "application/json");
            error = tokenService.fail(result.ticket ?? "");
          return res.status(500).send(result.responseContent + (error ? `\nError from Authlete fail endpoint: ${error}` : ""));

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
          console.error("Unknown action:", result.action);
          return res.status(500).send("Unknown token action");
      }
    } catch (error) {
      console.error("Token Error:", error);
      return res.status(500).send("Failed to process token request.");
    }
  }
};
