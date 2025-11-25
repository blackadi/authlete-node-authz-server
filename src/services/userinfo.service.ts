import { UserinfoIssueResponse, UserinfoResponse } from "@authlete/typescript-sdk/dist/commonjs/models";
import { authleteApi, serviceId } from "./authlete.service";

export class UserInfoService {
  async process(req: any): Promise<UserinfoResponse> {
    // Extract the access token from the Authorization header
    const authHeader = req.headers["authorization"] || "";

    // Call Authlete /userinfo API
    const response = await authleteApi.userinfo.process({
      serviceId,
      userinfoRequest: {
        token: authHeader.replace("Bearer ", ""),
      }
    });

    return response;
  }

  async issue(req: any): Promise<UserinfoIssueResponse> {
    // Extract the access token from the Authorization header
    const authHeader = req.headers["authorization"] || "";

    // Call Authlete /userinfo API to issue user info
    const response = await authleteApi.userinfo.issue({
      serviceId,
      userinfoIssueRequest: {
        token: authHeader.replace("Bearer ", ""),
      }
    });

    return response;
  }
}
