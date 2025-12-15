import { Request } from "express";
import { authleteApi, serviceId } from "./authlete.service";
import logger from "../utils/logger";
import {
  IntrospectionRequest,
  IntrospectionResponse,
  StandardIntrospectionRequest,
  StandardIntrospectionResponse,
} from "../../node_modules/@authlete/typescript-sdk/dist/commonjs/models";

export class IntrospectionService {
  async process(req: Request): Promise<IntrospectionResponse> {
    const { ...reqBody }: IntrospectionRequest = req.body;
    req.logger("Introspection parameters", { reqBody }) ||
      logger("Introspection parameters", { reqBody });

    // Call Authlete /introspection API
    const response = await authleteApi.introspection.process({
      serviceId,
      introspectionRequest: reqBody,
    });
    console.log("Introspection response:", response); // For testing only
    return response;
  }

  async standardprocess(req: Request): Promise<StandardIntrospectionResponse> {
    // Extract known StandardIntrospectionRequest fields, rest goes to otherBody
    let {
      withHiddenProperties,
      httpAcceptHeader,
      introspectionEncryptionAlg,
      introspectionEncryptionEnc,
      introspectionSignAlg,
      publicKeyForEncryption,
      rsUri,
      sharedKeyForEncryption,
      sharedKeyForSign,
      ...otherBody
    }: StandardIntrospectionRequest = req.body;

    req.logger("StandardIntrospectionService: received body", {
      withHiddenProperties,
      otherBodyKeys: Object.keys(otherBody || {}),
    }) ||
      logger("StandardIntrospectionService: received body", {
        withHiddenProperties,
        otherBodyKeys: Object.keys(otherBody || {}),
      });

    // Decode Basic auth if present
    const { authorization } = req.headers;
    let [clientId, clientSecret] = ["", ""];
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

    // Convert remaining fields to application/x-www-form-urlencoded
    const params = new URLSearchParams();

    if (otherBody && typeof otherBody === "object") {
      for (const [key, value] of Object.entries(otherBody)) {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      }
    }

    if (authorization && authorization.startsWith("Basic ")) {
      // Append client_id and client_secret from Basic auth
      params.append("client_id", clientId);
      params.append("client_secret", clientSecret);
    }

    const parameters = params.toString();

    req.logger("StandardIntrospectionService: URL-encoded parameters", {
      parameters,
    }) ||
      logger("StandardIntrospectionService: URL-encoded parameters", {
        parameters,
      });

    const reqBody: StandardIntrospectionRequest = {
      parameters,
      withHiddenProperties,
      httpAcceptHeader,
      introspectionEncryptionAlg,
      introspectionEncryptionEnc,
      introspectionSignAlg,
      publicKeyForEncryption,
      rsUri,
      sharedKeyForEncryption,
      sharedKeyForSign,
    };

    // Call Authlete /introspection API
    const response = await authleteApi.introspection.standardProcess({
      serviceId,
      standardIntrospectionRequest: reqBody,
    });

    return response;
  }
}
