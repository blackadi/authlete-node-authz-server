import { TokenFailResponse, TokenIssueResponse, TokenRequest, TokenResponse } from "@authlete/typescript-sdk/dist/commonjs/models";
import { authleteApi, serviceId } from "./authlete.service";
import { Request } from "express";

export class TokenService {
  async process(req: Request): Promise<TokenResponse> {


    let {clientId, clientSecret, clientCertificate, clientCertificatePath, htm, htu, accessToken, jwtAtClaims,accessTokenDuration, dpop, dpopNonceRequired,oauthClientAttestation, oauthClientAttestationPop,properties,refreshTokenDuration, ...otherBody}: TokenRequest = req.body;
    console.log("otherBody:", otherBody); //testing only

    const {...auth} = req.headers;
    //const auth = req.headers["authorization"];
    // console.log("req.headers.authorization:", auth); //testing only

    // Convert remaining fields to application/x-www-form-urlencoded
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(otherBody)) {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    }

    otherBody.parameters = params.toString();
    // console.log("xWwwFormUrlencoded:", otherBody.parameters); //testing only

    //decode basic base64 client credentials if present
    const {authorization} = req.headers;
    if (authorization && authorization.startsWith("Basic ")) {
      const base64Credentials = authorization.slice("Basic ".length);
      const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8");
      [clientId, clientSecret] = credentials.split(":");
    }

    const reqBody: TokenRequest = {
      parameters: otherBody.parameters,
      clientId: clientId,
      clientSecret: clientSecret,
      clientCertificate: clientCertificate,
      clientCertificatePath: clientCertificatePath,
      htm: htm,
      htu: htu,
      accessToken: accessToken,
      jwtAtClaims: jwtAtClaims,
      accessTokenDuration: accessTokenDuration,
      dpop: dpop,
      dpopNonceRequired: dpopNonceRequired,
      oauthClientAttestation: oauthClientAttestation,
      oauthClientAttestationPop: oauthClientAttestationPop,
      properties: properties,
      refreshTokenDuration: refreshTokenDuration
    }

    console.log("Token request body:", reqBody); //testing only
    
    // Call Authlete /token API
    const response = await authleteApi.token.process({
      serviceId,
      tokenRequest: reqBody
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
