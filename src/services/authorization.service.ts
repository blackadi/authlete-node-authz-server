import { AuthorizationFailResponse, AuthorizationResponse } from "@authlete/typescript-sdk/dist/commonjs/models";
import { authleteApi, serviceId } from "./authlete.service";

export class AuthorizationService {
  async process(req: any): Promise<AuthorizationResponse> {
    // Convert Express request into a query string
    const parameters = new URLSearchParams(req.query).toString();
    console.log("Authorization request parameters:", parameters); //testing only

    // Call Authlete /authorization API
    const response = await authleteApi.authorization.processRequest({
        serviceId: serviceId,
        authorizationRequest: {
            parameters
        }
    });

    return response;
  }

  async fail (ticket: string): Promise<AuthorizationFailResponse> {
    const response = await authleteApi.authorization.fail({
      serviceId,
      authorizationFailRequest: {
        ticket,
        reason: "NOT_AUTHENTICATED"
      }
    });
    
    return response;
  }

  async issue (ticket: string, subject: string): Promise<AuthorizationResponse> {
    const response = await authleteApi.authorization.issue({
      serviceId,
      authorizationIssueRequest: {
        ticket,
        subject
      }
    });

    return response;
  }
}
