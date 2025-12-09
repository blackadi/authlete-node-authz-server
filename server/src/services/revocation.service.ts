
import { RevocationResponse, RevocationRequest } from "../../node_modules/@authlete/typescript-sdk/dist/commonjs/models";
import { authleteApi, serviceId } from "./authlete.service";
import logger from "../utils/logger";

export class RevocationService {
  async process(req: any): Promise<RevocationResponse> {

    const {...reqBody}: RevocationRequest = req.body;
    req.logger?.debug("Revocation parameters", { reqBody }) || logger.debug("Revocation parameters", { reqBody });

    // Decode Basic auth if present
    const { authorization } = req.headers;
    if (authorization && authorization.startsWith("Basic ")) {
      const base64Credentials = authorization.slice("Basic ".length);
      const credentials = Buffer.from(base64Credentials, "base64").toString(
        "utf-8"
      );
      const [clientId, clientSecret] = credentials.split(":");
      reqBody.clientId = clientId;
      reqBody.clientSecret = clientSecret;
      req.logger?.debug("TokenService: decoded Basic auth", {
        clientId,
      }) ||
        logger.debug("TokenService: decoded Basic auth", { clientId });
    }

    // Call Authlete /introspection API
    const response = await authleteApi.revocation.process({
      serviceId,
      revocationRequest: reqBody
    });

    return response;
  }
}
