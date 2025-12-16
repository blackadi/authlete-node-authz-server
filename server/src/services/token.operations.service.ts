import {
  TokenCreateRequest,
  TokenCreateResponse,
} from "../../node_modules/@authlete/typescript-sdk/dist/commonjs/models";
import { authleteApi, serviceId } from "./authlete.service";
import { Request } from "express";
import logger from "../utils/logger";
import {
  IdtokenReissueResponse,
  TokenGetListResponse,
  TokenRevokeRequest,
  TokenRevokeResponse,
  TokenUpdateRequest,
  TokenUpdateResponse,
  GrantType,
} from "@authlete/typescript-sdk/src/models";
import createLocalJWT from "../utils/createLocalJWT";

export class TokenManagementService {
  async create(req: Request): Promise<TokenCreateResponse> {
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

    let reqBody: TokenCreateRequest;

    if (
      body.grant_type === "client_credentials" ||
      body.grantType === "client_credentials"
    ) {
      reqBody = {
        clientId: body.clientId,
        grantType: "CLIENT_CREDENTIALS",
        scopes:
          (typeof body.scope === "string" ? body.scope : "")
            .split(/\s+/)
            .filter(Boolean)
            .map((s) => s as unknown as Scope) ?? [],
        ...body,
      };
    } else if (
      body.grant_type === "authorization_code" ||
      body.grantType === "authorization_code"
    ) {
      reqBody = {
        clientId: body.clientId,
        grantType: "AUTHORIZATION_CODE",
        code: body.code,
        redirectUri: body.redirect_uri,
        ...body,
      };
    } else if (
      body.grant_type === "refresh_token" ||
      body.grantType === "refresh_token"
    ) {
      reqBody = {
        clientId: body.clientId,
        grantType: "REFRESH_TOKEN",
        refreshToken: body.refresh_token,
        ...body,
      };
    } else if (
      body.grant_type === "password" ||
      body.grantType === "password"
    ) {
      reqBody = {
        clientId: body.clientId,
        grantType: "PASSWORD",
        username: body.username,
        password: body.password,
        ...body,
      };
    } else if (
      body.grant_type === "device_code" ||
      body.grantType === "device_code"
    ) {
      reqBody = {
        clientId: body.clientId,
        grantType: "DEVICE_CODE",
        clientAssertion: body.client_assertion,
        clientAssertionType: body.client_assertion_type,
        ...body,
      };
    } else if (
      body.grant_type === "TOKEN_EXCHANGE" ||
      body.grantType === "TOKEN_EXCHANGE"
    ) {
      reqBody = {
        clientId: body.clientId,
        grantType: "TOKEN_EXCHANGE",
        clientAssertion: body.client_assertion,
        clientAssertionType: body.client_assertion_type,
        ...body,
      };
    } else if (
      body.grant_type === "JWT_BEARER" ||
      body.grantType === "JWT_BEARER"
    ) {
      reqBody = {
        clientId: body.clientId,
        grantType: "JWT_BEARER",
        clientAssertion: body.client_assertion,
        clientAssertionType: body.client_assertion_type,
        ...body,
      };
    } else if (
      body.grant_type === "IMPLICIT" ||
      body.grantType === "IMPLICIT"
    ) {
      reqBody = {
        clientId: body.clientId,
        grantType: "IMPLICIT",
        refreshToken: body.refresh_token,
        clientAssertion: body.client_assertion,
        clientAssertionType: body.client_assertion_type,
        ...body,
      };
    } else if (body.grant_type === "CIBA" || body.grantType === "CIBA") {
      reqBody = {
        clientId: body.clientId,
        grantType: "CIBA",
        clientAssertion: body.client_assertion,
        clientAssertionType: body.client_assertion_type,
        ...body,
      };
    } else if (
      body.grant_type === "PRE_AUTHORIZED_CODE" ||
      body.grantType === "PRE_AUTHORIZED_CODE"
    ) {
      reqBody = {
        clientId: body.clientId,
        grantType: "PRE_AUTHORIZED_CODE",
        clientAssertion: body.client_assertion,
        clientAssertionType: body.client_assertion_type,
        ...body,
      };
    }

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
        (typeof body.scope === "string" ? body.scope : "")
          .split(/\s+/)
          .filter(Boolean)
          .map((s) => s as unknown as Scope) ?? [],
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

  async revoke(req: TokenRevokeRequest): Promise<TokenRevokeResponse> {
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

  localSignedToken(iss: string, sub: string, aud: string[]): string {
    const token = createLocalJWT(iss, sub, aud);
    return token;
  }
}
