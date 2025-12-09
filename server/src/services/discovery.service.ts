import { Request } from "express";
import { ServiceConfigurationApiRequest, ServiceConfigurationApiResponse } from "../../node_modules/@authlete/typescript-sdk/dist/commonjs/models/operations";
import { authleteApi, serviceId } from "./authlete.service";
import logger from "../utils/logger";

export class DiscoveryService {
  async getConfiguration(req: Request): Promise<ServiceConfigurationApiResponse> {

    const {...reqBody}:ServiceConfigurationApiRequest = req.body;
    reqBody.serviceId = serviceId;
    reqBody.pretty = true;

    req.logger?.debug("Discovery parameters", { reqBody }) || logger.debug("Discovery parameters", { reqBody });
    // Call Authlete /authorization API
    // const response = await authleteApi.service.getConfiguration(reqBody);

    const fetchreq = await fetch(`${process.env.AUTHLETE_BASE_URL}/api/${process.env.AUTHLETE_SERVICE_ID}/service/configuration?pretty=true`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + process.env.AUTHLETE_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    if(!fetchreq.ok){
      logger.error("Failed to fetch service configuration", { status: fetchreq.status, statusText: fetchreq.statusText });
      throw new Error(`Failed to fetch service configuration: ${fetchreq.statusText}`);
    }

    const data = await fetchreq.json();

    return data;
    // return response;
  }
}
