import {
  TokenFailRequest,
  TokenFailResponse,
  TokenIssueRequest,
  TokenIssueResponse,
  TokenRequest,
  TokenResponse,
} from "../../node_modules/@authlete/typescript-sdk/dist/commonjs/models";
import { authleteApi, serviceId } from "./authlete.service";
import { Request } from "express";
import logger from "../utils/logger";
import { fetch } from "../utils/http";

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

    req.logger("TokenService: received body", {
      clientId,
      otherBody,
    }) || logger("TokenService: received body", { clientId, otherBody });

    // Decode Basic auth if present
    const { authorization } = req.headers;
    if (authorization && authorization.startsWith("Basic ")) {
      const base64Credentials = authorization.slice("Basic ".length);
      const credentials = Buffer.from(base64Credentials, "base64").toString(
        "utf-8"
      );
      [clientId, clientSecret] = credentials.split(":");
      req.logger("TokenService: decoded Basic auth", {
        clientId,
      }) || logger("TokenService: decoded Basic auth", { clientId });
    }

    // Prefer the raw request body if it was captured by the body parser's
    // `verify` hook. This preserves exact encoding and parameter order for
    // Authlete's requirement that `parameters` be the entire
    // application/x-www-form-urlencoded entity body.
    let parameters: string | undefined = (req as any).rawBody;

    if (!parameters) {
      // Fallback: rebuild parameters from parsed body (may reorder/encode
      // slightly differently than the original entity).
      const params = new URLSearchParams();
      if (otherBody && typeof otherBody === "object") {
        for (const [key, value] of Object.entries(otherBody)) {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        }
      }
      parameters = params.toString();
    }

    req.logger("TokenService: URL-encoded parameters (length), body", {
      length: parameters.length,
      body: parameters,
    }) ||
      logger("TokenService: URL-encoded parameters (length), body", {
        length: parameters.length,
        body: parameters,
      });

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

    req.logger("TokenService: calling Authlete token endpoint", {
      clientId,
      parametersLength: parameters.length,
      parameters,
    }) ||
      logger("TokenService: calling Authlete token endpoint", {
        clientId,
        parametersLength: parameters.length,
        parameters,
      });

    // Call Authlete /token API
    if (reqBody.parameters.includes("refresh_token")) {
      const response = await fetch(
        `${process.env.AUTHLETE_BASE_URL}/api/${process.env.AUTHLETE_SERVICE_ID}/auth/token`,
        "POST",
        { parameters: reqBody.parameters, clientId, clientSecret }
      );

      return response;
    } else {
      const response = await authleteApi.token.process({
        serviceId,
        tokenRequest: reqBody,
      });

      return response;
    }
  }

  async fail(req: TokenFailRequest): Promise<TokenFailResponse> {
    const response = await authleteApi.token.fail({
      serviceId,
      tokenFailRequest: req,
    });

    return response;
  }

  async issue(req: TokenIssueRequest): Promise<TokenIssueResponse> {
    const response = await authleteApi.token.issue({
      serviceId,
      tokenIssueRequest: req,
    });

    return response;
  }
}
