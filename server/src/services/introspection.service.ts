import { authleteApi, serviceId } from "./authlete.service";
import logger from "../utils/logger";
import { IntrospectionRequest, IntrospectionResponse, StandardIntrospectionRequest, StandardIntrospectionResponse } from "../../node_modules/@authlete/typescript-sdk/dist/commonjs/models";

export class IntrospectionService {
  async process(req: any): Promise<IntrospectionResponse> {
    const { ...reqBody }: IntrospectionRequest = req.body;
    (req as any).logger?.debug("Introspection parameters", { reqBody }) ||
      logger.debug("Introspection parameters", { reqBody });

      console.log("Introspection parameters:", reqBody); // For testing only
    // Call Authlete /introspection API
    const response = await authleteApi.introspection.process({
      serviceId,
      introspectionRequest: reqBody,
    });
    console.log("Introspection response:", response); // For testing only
    return response;
  }

  async standardprocess(req: any): Promise<StandardIntrospectionResponse> {
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

    (req as any).logger?.debug(
      "StandardIntrospectionService: received body",
      { withHiddenProperties, otherBodyKeys: Object.keys(otherBody || {}) }
    ) ||
      logger.debug("StandardIntrospectionService: received body", {
        withHiddenProperties,
        otherBodyKeys: Object.keys(otherBody || {}),
      });

    // Convert remaining fields to application/x-www-form-urlencoded
    const params = new URLSearchParams();

    if (otherBody && typeof otherBody === "object") {
      for (const [key, value] of Object.entries(otherBody)) {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      }
    }

    const parameters = params.toString();

    (req as any).logger?.debug(
      "StandardIntrospectionService: URL-encoded parameters",
      { parameters }
    ) ||
      logger.debug("StandardIntrospectionService: URL-encoded parameters", {
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

