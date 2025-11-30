import { Request } from "express";
import { ServiceConfigurationApiRequest, ServiceConfigurationApiResponse } from "@authlete/typescript-sdk/dist/commonjs/models/operations";
import { authleteApi, serviceId } from "./authlete.service";

export class DiscoveryService {
  async getConfiguration(req: Request): Promise<ServiceConfigurationApiResponse> {

    const {...reqBody}:ServiceConfigurationApiRequest = req.body;
    reqBody.serviceId = serviceId;
    reqBody.pretty = true;

    console.log("Discovery parameters:", reqBody); //testing only
    // Call Authlete /authorization API
    const response = await authleteApi.service.getConfiguration(reqBody);

    
    return response;
  }
}
