import { Request } from "express";
import { ServiceConfigurationApiRequest, ServiceConfigurationApiResponse } from "../../node_modules/@authlete/typescript-sdk/dist/commonjs/models/operations";
import { authleteApi, serviceId } from "./authlete.service";
import logger from "../utils/logger";

export class DiscoveryService {
  async getConfiguration(req: Request): Promise<ServiceConfigurationApiResponse> {

    const {...reqBody}:ServiceConfigurationApiRequest = req.body;
    reqBody.serviceId = serviceId;
    reqBody.pretty = true;

    (req as any).logger?.debug("Discovery parameters", { reqBody }) || logger.debug("Discovery parameters", { reqBody });
    // Call Authlete /authorization API
    const response = await authleteApi.service.getConfiguration(reqBody);

    
    return response;
  }
}
