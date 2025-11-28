import { authleteApi, serviceId } from "./authlete.service";
import { IntrospectionRequest, IntrospectionResponse, StandardIntrospectionRequest, StandardIntrospectionResponse } from "@authlete/typescript-sdk/dist/commonjs/models";

export class IntrospectionService {
  async process(req: any): Promise<IntrospectionResponse> {

    const {...reqBody}: IntrospectionRequest = req.body;
    console.log("Introspection parameters:", reqBody); //testing only

    // Call Authlete /introspection API
    const response = await authleteApi.introspection.process({
      serviceId,
      introspectionRequest: reqBody
    });

    return response;
  }

  async standardprocess(req: any): Promise<StandardIntrospectionResponse> {

    let {withHiddenProperties, httpAcceptHeader, introspectionEncryptionAlg,introspectionEncryptionEnc,introspectionSignAlg,publicKeyForEncryption,rsUri,sharedKeyForEncryption,sharedKeyForSign, ...otherBody}: StandardIntrospectionRequest = req.body;
    
    // Convert remaining fields to application/x-www-form-urlencoded
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(otherBody)) {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    }

    otherBody.parameters = params.toString();

    const reqBody: StandardIntrospectionRequest = {
      parameters: otherBody.parameters,
      withHiddenProperties: withHiddenProperties,
      httpAcceptHeader: httpAcceptHeader,
      introspectionEncryptionAlg: introspectionEncryptionAlg,
      introspectionEncryptionEnc: introspectionEncryptionEnc,
      introspectionSignAlg: introspectionSignAlg,
      publicKeyForEncryption: publicKeyForEncryption,
      rsUri: rsUri,
      sharedKeyForEncryption: sharedKeyForEncryption,
      sharedKeyForSign: sharedKeyForSign
    };

    console.log("Introspection parameters:", reqBody); //testing only
    
    // Call Authlete /introspection API
    const response = await authleteApi.introspection.standardProcess({
      serviceId,
      standardIntrospectionRequest: reqBody
    });

    return response;
  }
}
