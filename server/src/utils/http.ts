/**
 * Utility functions for making HTTP requests to the Authlete API.
 *
 * Example usage:
 *
 * const response = await fetch('api/token', 'POST', { grant_type: 'authorization_code', code: 'AUTHORIZATION_CODE', redirect_uri: 'http://localhost:3000/callback' });
 */

import { Request } from "express";
import { authleteConfig } from "../config/authlete.config";
import logger from "./logger";

/**
 * Makes a strongly typed HTTP request to the Authlete API.
 * @param {string} url The URL path of the API endpoint.
 * @param {string} method The HTTP method to use (e.g. GET, POST, PUT, DELETE).
 * @param {*} [body] The request body, if applicable.
 * @return {Promise<T>} A Promise that resolves to the HTTP response.
 */
export const fetch = async <T>(
  url: string,
  method: string,
  body?: object
): Promise<T> => {
  logger(`fetch: ${method} ${url}`, body ? { body } : null);
  try {
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${authleteConfig.AccessToken}`,
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await globalThis.fetch(url, options);
    logger(`fetch: response`, response);
    const json = await response.json();
    logger(`fetch: json`, json);

    return json;
  } catch (error) {
    logger(`fetch: error`, error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Unexpected error type");
    }
  }
};
