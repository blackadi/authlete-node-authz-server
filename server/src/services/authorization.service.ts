import { NextFunction, Request, Response } from "express";
import {
  AuthorizationFailRequestReason,
  AuthorizationFailResponse,
  AuthorizationIssueResponse,
  AuthorizationRequest,
  AuthorizationResponse,
} from "../../node_modules/@authlete/typescript-sdk/dist/commonjs/models";
import { authleteApi, serviceId } from "./authlete.service";
import session from "express-session";
import logger from "../utils/logger";

export class AuthorizationService {
  async process(req: Request): Promise<AuthorizationResponse> {
    // Convert Express request into a query string
    const { context, ...reqBody }: AuthorizationRequest =
      req.method === "GET" ? req.query : req.body;
    (req as any).logger?.debug("Authorization request parameters", { params: reqBody });
    logger.debug("Authorization request parameters", { params: reqBody });

    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(reqBody)) {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    }

    reqBody.parameters = params.toString();
    // Call Authlete /authorization API
    const response = await authleteApi.authorization.processRequest({
      serviceId: serviceId,
      authorizationRequest: reqBody,
    });

    return response;
  }

  async fail(
    ticket: string,
    reason: AuthorizationFailRequestReason
  ): Promise<AuthorizationFailResponse> {
    const response = await authleteApi.authorization.fail({
      serviceId,
      authorizationFailRequest: {
        ticket,
        reason,
      },
    });

    return response;
  }

  async issue(
    req: Request & { session: Partial<session.SessionData> }
  ): Promise<AuthorizationIssueResponse> {
    try {
      let ticket = req.session.authorization?.ticket;
      let subject = req.session.user;

      // Throw custom errors that the error handler will catch
      if (!ticket) {
        const err = new Error(
          "Missing ticket in session - authorization context lost"
        );
        (err as any).status = 400; // Bad Request
        throw err;
      }

      if (!subject) {
        const err = new Error(
          "Missing user subject in session - user not authenticated"
        );
        (err as any).status = 401; // Unauthorized
        throw err;
      }

      (req as any).logger?.info("Issue authorization response parameters", {
        ticket,
        subject,
      });
      logger.info("Issue authorization response parameters", { ticket, subject });

      const optionalClaims =
        '{"name": "Odai Shalabi","email": "blackadi@blackadi.dev","email_verified": true,"picture": "https://lh3.googleusercontent.com/a/ACg8ocKxOjqZ-NPCUuRAOATIfXjeNrawMCtk6xHBKHJagUKPEURfHWno=s288-c-no"}';

      const response = await authleteApi.authorization.issue({
        serviceId,
        authorizationIssueRequest: {
          ticket: ticket,
          subject: subject,
          claims: optionalClaims,
        },
      });

      return response;
    } catch (error) {
      // Let the error bubble up to be caught by route handler
      throw error;
    }
  }
}
