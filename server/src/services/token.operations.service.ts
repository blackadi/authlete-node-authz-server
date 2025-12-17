import {
  TokenCreateRequest,
  TokenCreateResponse,
} from "../../node_modules/@authlete/typescript-sdk/dist/commonjs/models";
import { authleteApi, serviceId } from "./authlete.service";
import { Request } from "express";
import logger from "../utils/logger";
import {
  IdtokenReissueResponse,
  Scope,
  TokenGetListResponse,
  TokenRevokeRequest,
  TokenRevokeResponse,
  TokenUpdateRequest,
  TokenUpdateResponse,
} from "@authlete/typescript-sdk/src/models";
import createLocalJWT from "../utils/createLocalJWT";

export class TokenManagementService {
  async create(req: Request | any): Promise<TokenCreateResponse> {
    let { ...body }: TokenCreateRequest = req.body;
    logger("TokenCreateService: calling Authlete token management endpoint", {
      body,
    });

    // Decode Basic auth if present
    const { authorization } = req.headers;
    if (authorization && authorization.startsWith("Basic ")) {
      const base64Credentials = authorization.slice("Basic ".length);
      const credentials = Buffer.from(base64Credentials, "base64").toString(
        "utf-8"
      );
      const [client_id, client_secret] = credentials.split(":");
      body.clientId = Number(client_id);
    }

    const reqBody: TokenCreateRequest = {
      scopes:
        (typeof req.body.scope === "string" ? req.body.scope : "")
          .split(/\s+/)
          .filter(Boolean)
          .map((s: Scope) => s as unknown as Scope) ?? [],
      ...body,
      grantType:
        req.body.grant_type === "client_credentials" ||
        req.body.grantType === "client_credentials"
          ? "CLIENT_CREDENTIALS"
          : req.body.grant_type === "authorization_code" ||
            req.body.grantType === "authorization_code"
          ? "AUTHORIZATION_CODE"
          : req.body.grant_type === "refresh_token" ||
            req.body.grantType === "refresh_token"
          ? "REFRESH_TOKEN"
          : req.body.grant_type === "password" ||
            req.body.grantType === "password"
          ? "PASSWORD"
          : req.body.grant_type === "implicit" ||
            req.body.grantType === "implicit"
          ? "IMPLICIT"
          : req.body.grant_type === "token_exchange" ||
            req.body.grantType === "token_exchange"
          ? "TOKEN_EXCHANGE"
          : req.body.grant_type == "device_code" ||
            req.body.grantType === "device_code"
          ? "DEVICE_CODE"
          : req.body.grant_type ===
              "urn:ietf:params:oauth:grant-type:jwt-bearer" ||
            req.body.grantType === "urn:ietf:params:oauth:grant-type:jwt-bearer"
          ? "JWT_BEARER"
          : req.body.grantType ===
              "grant_type=urn:ietf:params:oauth:grant-type:pre-authorized_code" ||
            req.body.grantType ===
              "grant_type=urn:ietf:params:oauth:grant-type:pre-authorized_code"
          ? "PRE_AUTHORIZED_CODE"
          : "AUTHORIZATION_CODE", // default to AUTHORIZATION_CODE
    };

    logger(
      "TokenCreateService: calling Authlete token management endpoint",
      reqBody
    );
    const response = await authleteApi.token.management.create({
      serviceId,
      tokenCreateRequest: {
        ...reqBody,
      },
    });

    return response;
  }

  async update(req: Request): Promise<TokenUpdateResponse> {
    let { ...body }: TokenUpdateRequest = req.body;
    logger("TokenUpdateService: calling Authlete token management endpoint", {
      body,
    });
    const reqBody: TokenUpdateRequest = {
      ...body,
      scopes:
        (typeof req.body.scope === "string" ? req.body.scope : "")
          .split(/\s+/)
          .filter(Boolean)
          .map((s: Scope) => s as unknown as Scope) ?? [],
    } as TokenUpdateRequest;

    logger(
      "TokenUpdateService: calling Authlete token management endpoint",
      reqBody
    );

    const response = await authleteApi.token.management.update({
      serviceId,
      tokenUpdateRequest: reqBody,
    });

    return response;
  }

  async delete(accessTokenIdentifier: string): Promise<void> {
    const response = await authleteApi.token.management.delete({
      serviceId,
      accessTokenIdentifier,
    });

    return response;
  }

  async list(): Promise<TokenGetListResponse> {
    logger("TokenListService: calling Authlete token management endpoint");

    const response = await authleteApi.token.management.list({
      serviceId,
    });

    return response;
  }

  async reissueIdToken(): Promise<IdtokenReissueResponse> {
    logger(
      "TokenReissueIdTokenService: calling Authlete token management endpoint"
    );

    const response = await authleteApi.token.management.reissueIdToken({
      serviceId,
    });

    return response;
  }

  async revoke(req: TokenRevokeRequest | any): Promise<TokenRevokeResponse> {
    logger(
      "TokenDeleteService: calling Authlete token management endpoint",
      req
    );

    const response = await authleteApi.token.management.revoke({
      serviceId,
      tokenRevokeRequest: req,
    });

    return response;
  }

  localSignedToken(
    iss: string,
    sub: string,
    aud: string[]
  ): {
    token: string;
    publicKey: string;
  } {
    const { token, publicKey } = createLocalJWT(iss, sub, aud);
    return { token, publicKey };
  }
}
