import { configDotenv } from "dotenv";

configDotenv();
export const authleteConfig = {
  baseUrl: process.env.AUTHLETE_BASE_URL || "",
  serviceId: process.env.AUTHLETE_SERVICE_ID || "",
  AccessToken: process.env.AUTHLETE_ACCESS_TOKEN || "",
};

export const jwt = {
  privateKey: process.env.JWT_PRIVATE_KEY_PEM || "",
  publicKey: process.env.JWT_PUBLIC_KEY_PEM || "",
  issuer: process.env.JWT_ISSUER || "",
};

export const jwks = {
  uri: process.env.JWKS_URI || "",
};

export const token = {
  accessTokenType: process.env.ACCESS_TOKEN_TYPE || "opaque",
  issueRefresh: process.env.ISSUE_REFRESH_TOKEN === "true",
};
