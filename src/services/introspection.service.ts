import { authleteApi, serviceId } from "./authlete.service";
import { IntrospectionResponse, StandardIntrospectionResponse } from "@authlete/typescript-sdk/dist/commonjs/models";

export class IntrospectionService {
  async process(req: any): Promise<IntrospectionResponse> {

    // Convert POST body to form-url-encoded string
    const parameters = new URLSearchParams(req.body).toString();
    console.log("Introspection parameters:", parameters); //testing only

    // Call Authlete /introspection API
    const response = await authleteApi.introspection.process({
      serviceId,
      introspectionRequest: {
        token: req.body.token,
        scopes: req.body.scopes,
        subject: req.body.subject,
      }
    });

    return response;
  }

  async standardprocess(req: any): Promise<StandardIntrospectionResponse> {

    // Convert POST body to form-url-encoded string
    const parameters = new URLSearchParams(req.body).toString();

    // Authorization header (client credentials)
    const authHeader = req.headers["authorization"] || "";
    const token = authHeader.replace("Bearer ", "")
    
    // Call Authlete /introspection API
    const response = await authleteApi.introspection.standardProcess({
      serviceId,
      standardIntrospectionRequest: {
        parameters
      }
    });

    return response;
  }
}
