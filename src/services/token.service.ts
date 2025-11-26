import { TokenFailResponse, TokenIssueResponse, TokenResponse } from "@authlete/typescript-sdk/dist/commonjs/models";
import { authleteApi, serviceId } from "./authlete.service";


export class TokenService {
  async process(req: any): Promise<TokenResponse> {
    // Convert Express POST body into x-www-form-urlencoded
    console.log("req.body:", req.body); //testing only
    const parameters = new URLSearchParams(req.body).toString();
    console.log("Token request parameters:", parameters); //testing only

    const auth = req.headers["authorization"];
    console.log("req.headers.authorization:", auth); //testing only

    //decode basic base64 client credentials if present
    if (auth && auth.startsWith("Basic ")) {
      const base64Credentials = auth.slice("Basic ".length);
      const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8");
      const [clientId, clientSecret] = credentials.split(":");
      req.body.clientId = clientId;
      req.body.clientSecret = clientSecret;
      console.log("Decoded clientId:", req.body.clientId);
      console.log("Decoded clientSecret:", req.body.clientSecret);
    }

    // Call Authlete /token API
    const response = await authleteApi.token.process({
      serviceId,
      tokenRequest:{
        parameters: parameters,
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
