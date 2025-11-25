import { ServiceJwksGetResponse } from "@authlete/typescript-sdk/dist/commonjs/models";
import { authleteApi, serviceId } from "./authlete.service";

export class JwksService {
  async serviceJwksGetApi(): Promise<ServiceJwksGetResponse> {

    // Call Authlete /authorization API
    const response = await authleteApi.jwkSetEndpoint.serviceJwksGetApi({
        serviceId: serviceId,
    });

    return response;
  }
}
