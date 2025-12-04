
import { RevocationResponse, RevocationRequest } from "../../node_modules/@authlete/typescript-sdk/dist/commonjs/models";
import { authleteApi, serviceId } from "./authlete.service";
import logger from "../utils/logger";

export class RevocationService {
  async process(req: any): Promise<RevocationResponse> {

    const {...reqBody}: RevocationRequest = req.body;
    (req as any).logger?.debug("Revocation parameters", { reqBody }) || logger.debug("Revocation parameters", { reqBody });

    // Call Authlete /introspection API
    const response = await authleteApi.revocation.process({
      serviceId,
      revocationRequest: reqBody
    });

    return response;
  }
}
