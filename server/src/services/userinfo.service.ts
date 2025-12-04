import { Request } from "express";
import { UserinfoIssueRequest, UserinfoIssueResponse, UserinfoRequest, UserinfoResponse } from "../../node_modules/@authlete/typescript-sdk/dist/commonjs/models";
import { authleteApi, serviceId } from "./authlete.service";
import logger from "../utils/logger";

export class UserInfoService {
  async process(req: Request): Promise<UserinfoResponse> {
    const {...reqBody}: UserinfoRequest = req.method === "GET" ? {} : req.body;

    if(req.method === "GET") {
      const authHeader = req.headers["authorization"] || "";
      reqBody.token = authHeader.replace("Bearer ", "");
    }
    (req as any).logger?.debug("Userinfo parameters", { reqBody }) || logger.debug("Userinfo parameters", { reqBody });

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
