import { UserinfoIssueRequest, UserinfoIssueResponse, UserinfoRequest, UserinfoResponse } from "@authlete/typescript-sdk/dist/commonjs/models";
import { authleteApi, serviceId } from "./authlete.service";

export class UserInfoService {
  async process(req: any): Promise<UserinfoResponse> {
    const {...reqBody}: UserinfoRequest = req.body;
    console.log("Userinfo parameters:", reqBody); //testing only

    // Call Authlete /userinfo API
    const response = await authleteApi.userinfo.process({
      serviceId,
      userinfoRequest: reqBody
    });

    return response;
  }

  async issue(req: any): Promise<UserinfoIssueResponse> {
    const {...reqBody}: UserinfoIssueRequest = req.body;

    // Call Authlete /userinfo API to issue user info
    const response = await authleteApi.userinfo.issue({
      serviceId,
      userinfoIssueRequest: reqBody
    });

    return response;
  }
}
