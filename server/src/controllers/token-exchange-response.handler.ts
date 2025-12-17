import { Request, NextFunction, Response } from "express";
import logger from "../utils/logger";
import {
  TokenCreateRequest,
  TokenResponse,
} from "@authlete/typescript-sdk/src/models";
import { TokenManagementService } from "../services/token.operations.service";

const tokenManagementService = new TokenManagementService();
export async function handleJwtBearerGrant(
  res: Response,
  result: TokenResponse,
  next: NextFunction
) {
  try {
    const action = result.action;
    switch (action) {
      case "INTERNAL_SERVER_ERROR":
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("Pragma", "no-cache");
        return res.status(500).send(result.responseContent ?? result);

      case "BAD_REQUEST":
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("Pragma", "no-cache");
        return res.status(400).send(result.responseContent ?? result);

      default:
        // req.logger?.error("Unknown token.fail action", { action: result.action });
        logger.error("Unknown token.fail action", { action: result.action });
        return res.status(500).send("Unknown token.fail action");
    }
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error("handleJwtBearerGrant Response Error", {
      message: error.message,
    });
    return next(error);
  }
}

export async function handleTokenExchange(
  req: Request,
  res: Response,
  result: TokenResponse,
  next: NextFunction
) {
  try {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-cache, no-store");

    const subjectToken = result.subjectToken;
    const clientId = result.clientId as number;
    const scopes = result.scopes;

    const tokenCreateRequest: TokenCreateRequest = {
      grantType: "TOKEN_EXCHANGE",
      clientId,
      scopes,
      subject: subjectToken,
    } as TokenCreateRequest;

    req.body = tokenCreateRequest;

    logger("handleTokenExchange: tokenCreateRequest", req.body);

    // Call Authlete to create token
    const tokenCreateResponse = await tokenManagementService.create(req);

    switch (tokenCreateResponse.action) {
      case "OK":
        return res
          .status(200)
          .type("application/json")
          .send({ tokenCreateResponse });

      case "BAD_REQUEST":
        return res
          .status(400)
          .type("application/json")
          .send({ tokenCreateResponse });

      case "FORBIDDEN":
        return res
          .status(403)
          .type("application/json")
          .send({ tokenCreateResponse });

      case "INTERNAL_SERVER_ERROR":
        return res
          .status(500)
          .type("application/json")
          .send({ tokenCreateResponse });

      default:
        logger.error("Unknown TOKEN_EXCHANGE action", tokenCreateResponse);
        return res
          .status(500)
          .type("application/json")
          .send(
            JSON.stringify({
              error: "Unknown create token action",
              tokenCreateResponse,
            })
          );
    }
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error("tokenCreateResponse Error", { message: error.message });
    return next(error);
  }
}

export default { handleJwtBearerGrant, handleTokenExchange };
