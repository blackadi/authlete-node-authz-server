import { TokenFailResponse, TokenIssueResponse, TokenResponse } from "@authlete/typescript-sdk/dist/commonjs/models";
import { authleteApi, serviceId } from "./authlete.service";


export class TokenService {
  async process(req: any): Promise<TokenResponse> {
    // Convert Express POST body into x-www-form-urlencoded
    const parameters = new URLSearchParams(req.body).toString();
    console.log("Token request parameters:", parameters); //testing only
    console.log("req.body.clientId:", req.body.clientId); //testing only
    console.log("req.body.clientSecret:", req.body.clientSecret); //testing only
    console.log("req.body.parameters:", req.body.parameters); //testing only

    // Call Authlete /token API
    const response = await authleteApi.token.process({
      serviceId,
      tokenRequest:{
        parameters: req.body.parameters,
        clientId: req.body.clientId,
        clientSecret: req.body.clientSecret
      }
    });

    return response;
  }

  async fail (ticket: string): Promise<TokenFailResponse> {
    const response = await authleteApi.token.fail({
      serviceId,
      tokenFailRequest: {
        ticket,
        reason: "INVALID_RESOURCE_OWNER_CREDENTIALS"
      }
    });
    
    return response;
  }

  async issue (ticket: string, subject: string): Promise<TokenIssueResponse> {
    const response = await authleteApi.token.issue({
      serviceId,
      tokenIssueRequest: {
        ticket,
        subject
      }
    });

    return response;
  }
}
