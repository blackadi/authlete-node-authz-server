
import { RevocationResponse, RevocationRequest } from "@authlete/typescript-sdk/dist/commonjs/models";
import { authleteApi, serviceId } from "./authlete.service";

export class RevocationService {
  async process(req: any): Promise<RevocationResponse> {

    const {...reqBody}: RevocationRequest = req.body;
    console.log("Revocation parameters:", reqBody); //testing only

    // Call Authlete /introspection API
    const response = await authleteApi.revocation.process({
      serviceId,
      revocationRequest: reqBody
    });

    return response;
  }
}
