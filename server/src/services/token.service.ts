import {
  TokenFailResponse,
  TokenIssueResponse,
  TokenRequest,
  TokenResponse,
} from "../../node_modules/@authlete/typescript-sdk/dist/commonjs/models";
import { authleteApi, serviceId } from "./authlete.service";
import { Request } from "express";
import logger from "../utils/logger";

export class TokenService {
  async process(req: Request): Promise<TokenResponse> {
    // Extract known Authlete TokenRequest fields, everything else goes into otherBody
    let {
      clientId,
      clientSecret,
      clientCertificate,
      clientCertificatePath,
      htm,
      htu,
      accessToken,
      jwtAtClaims,
      accessTokenDuration,
      dpop,
      dpopNonceRequired,
      oauthClientAttestation,
      oauthClientAttestationPop,
      properties,
      refreshTokenDuration,
      ...otherBody
    }: TokenRequest = req.body;

    (req as any).logger?.debug("TokenService: received body", {
      clientId,
      otherBody,
    }) ||
      logger.debug("TokenService: received body", { clientId, otherBody });

    // Decode Basic auth if present
    const { authorization } = req.headers;
    if (authorization && authorization.startsWith("Basic ")) {
      const base64Credentials = authorization.slice("Basic ".length);
      const credentials = Buffer.from(base64Credentials, "base64").toString(
        "utf-8"
      );
      [clientId, clientSecret] = credentials.split(":");
      (req as any).logger?.debug("TokenService: decoded Basic auth", {
        clientId,
      }) ||
        logger.debug("TokenService: decoded Basic auth", { clientId });
    }

    // Build URL-encoded parameter string from all form fields and others
    const params = new URLSearchParams();

    // Add known TokenRequest fields
    if (otherBody && typeof otherBody === "object") {
      for (const [key, value] of Object.entries(otherBody)) {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      }
    }

    const parameters = params.toString();

    (req as any).logger?.debug("TokenService: URL-encoded parameters", {
      parameters,
    }) ||
      logger.debug("TokenService: URL-encoded parameters", { parameters });

    // Build Authlete TokenRequest
    const reqBody: TokenRequest = {
      parameters,
      clientId,
      clientSecret,
      clientCertificate,
      clientCertificatePath,
      htm,
      htu,
      accessToken,
      jwtAtClaims,
      accessTokenDuration,
      dpop,
      dpopNonceRequired,
      oauthClientAttestation,
      oauthClientAttestationPop,
      properties,
      refreshTokenDuration,
    } as TokenRequest;

    (req as any).logger?.info("TokenService: calling Authlete token endpoint", {
      clientId,
      parametersLength: parameters.length,
    }) ||
      logger.info("TokenService: calling Authlete token endpoint", {
        clientId,
        parametersLength: parameters.length,
      });

    // Call Authlete /token API
    const response = await authleteApi.token.process({
      serviceId,
      tokenRequest: reqBody,
    });

    return response;
  }

  async fail(ticket: string): Promise<TokenFailResponse> {
    const response = await authleteApi.token.fail({
      serviceId,
      tokenFailRequest: {
        ticket,
        reason: "INVALID_RESOURCE_OWNER_CREDENTIALS",
      },
    });

    return response;
  }

  async issue(ticket: string, subject: string): Promise<TokenIssueResponse> {
    const response = await authleteApi.token.issue({
      serviceId,
      tokenIssueRequest: {
        ticket,
        subject,
      },
    });

    return response;
  }
}
