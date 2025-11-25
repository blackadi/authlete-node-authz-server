
import { RevocationResponse } from "@authlete/typescript-sdk/dist/commonjs/models";
import { authleteApi, serviceId, clientId, clientSecret } from "./authlete.service";

export class RevocationService {
  async process(req: any): Promise<RevocationResponse> {

    // Convert POST body to form-url-encoded string
    const parameters = new URLSearchParams(req.body).toString();
    console.log("Revocation parameters:", parameters); //testing only

    // Call Authlete /introspection API
    const response = await authleteApi.revocation.process({
      serviceId,
      revocationRequest: {
        parameters,
        clientId,
        clientSecret
      }
    });

    return response;
  }
}
