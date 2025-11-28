import { AuthorizationFailResponse, AuthorizationRequest, AuthorizationResponse } from "@authlete/typescript-sdk/dist/commonjs/models";
import { authleteApi, serviceId } from "./authlete.service";

export class AuthorizationService {
  async process(req: any): Promise<AuthorizationResponse> {
    
    // Convert Express request into a query string
    const {context, ...reqBody}: AuthorizationRequest = req.method === "GET" ? req.query : req.body;
    console.log("Authorization request parameters:", reqBody); //testing only

    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(reqBody)) {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    }

    reqBody.parameters = params.toString();
    // Call Authlete /authorization API
    const response = await authleteApi.authorization.processRequest({
        serviceId: serviceId,
        authorizationRequest: reqBody
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
