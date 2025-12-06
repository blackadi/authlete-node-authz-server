import { Request, Response, NextFunction } from "express";
import { UserInfoService } from "../services/userinfo.service";
import logger from "../utils/logger";
import { UserinfoIssueRequest, UserinfoResponse } from "@authlete/typescript-sdk/src/models";

const userInfoService = new UserInfoService();

export const userinfoController = {
  handleUserInfo: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await userInfoService.process(req);

      switch (result.action) {
        case "BAD_REQUEST":
          // RFC 6750: client did not present an access token
          res.setHeader("WWW-Authenticate", result.responseContent ?? "");
          res.setHeader("Cache-Control", "no-store");
          res.setHeader("Pragma", "no-cache");
          return res.status(400).send(result.responseContent ?? "Bad Request");

        case "UNAUTHORIZED":
          // RFC 6750: invalid/expired token
          res.setHeader("WWW-Authenticate", result.responseContent ?? "");
          res.setHeader("Cache-Control", "no-store");
          res.setHeader("Pragma", "no-cache");
          return res.status(401).send(result.responseContent ?? "Unauthorized");

        case "INTERNAL_SERVER_ERROR":
          // Authlete indicates a server-side error
          res.setHeader("WWW-Authenticate", result.responseContent ?? "");
          res.setHeader("Cache-Control", "no-store");
          res.setHeader("Pragma", "no-cache");
          return res.status(500).send(result.responseContent ?? "Internal Server Error");

        case "FORBIDDEN":
          // Token does not include `openid` scope
          res.setHeader("WWW-Authenticate", result.responseContent ?? "");
          res.setHeader("Cache-Control", "no-store");
          res.setHeader("Pragma", "no-cache");
          return res.status(403).send(result.responseContent ?? "Forbidden");

        case "OK":
          // Authlete indicates the access token is valid. According to Authlete
          // the authorization server should collect the requested claims for
          // the subject and call Authlete's /auth/userinfo/issue API. This
          // implementation returns `result.responseContent` when provided by
          // Authlete. If `responseContent` is not present, the developer must
          // implement claim collection (DB lookup) and call
          // `userInfoService.issue(issueRequest)` to produce the final userinfo
          // response. See comments below.
          if (result.responseContent) {
            res.setHeader("Content-Type", "application/json");
            return res.status(200).send(result.responseContent);
          }

          // If we reach here, Authlete did not provide final content. A
          // production implementation must:
          // 1. Inspect `result.subject` and `result.claims` (names)
          // 2. Retrieve claim values from your user database for the subject
          // 3. Build a UserinfoIssueRequest and call
          //    `userInfoService.issue(issueRequest)` and return its output

          // Example placeholder behaviour for development: attempt to use the
          // session user as the subject and synthesize a few fields. Replace
          // this with a real DB lookup in production.
          const subject = result.subject;
          const claimNames: string[] = (result as any).claims || [];

          if (!subject) {
            req.logger?.error("Userinfo OK but no subject returned by Authlete", { result });
            logger.error("Userinfo OK but no subject returned by Authlete", { result });
            res.setHeader("WWW-Authenticate", 'Bearer error="server_error", error_description="No subject returned"');
            res.setHeader("Cache-Control", "no-store");
            res.setHeader("Pragma", "no-cache");
            return res.status(500).send("Missing subject in userinfo response");
          }

          // Simple dev-time claim synthesis (replace with DB lookup)
          // `result.claims` is expected to be a string[] of requested claim names.
          // Build an object with only the requested claims, then serialize it
          // to JSON for `UserinfoIssueRequest.claims` (which is a string).
          const synthesizedClaimsObj: Record<string, any> = {};
          // Helper to set common claim values for the subject (dev-time)
          const setDevClaim = (name: string) => {
            switch (name) {
              case "sub":
                return subject;
              case "name":
                return subject;
              case "given_name":
                return "BlackAdi";
              case "family_name":
                return "BlackAdi";
              case "middle_name":
                return null;
              case "nickname":
                return subject;
              case "preferred_username":
                return subject;
              case "profile":
                return `https://blackadi.dev/users/${subject}`;
              case "picture":
                return `https://lh3.googleusercontent.com/a/ACg8ocKxOjqZ-NPCUuRAOATIfXjeNrawMCtk6xHBKHJagUKPEURfHWno=s288-c-no`;
              case "website":
                return `https://blackadi.dev/${subject}`;
              case "gender":
                return null;
              case "birthdate":
                return null;
              case "zoneinfo":
                return "UTC";
              case "locale":
                return "en-US";
              case "email":
                return `${subject}@example.com`;
              case "email_verified":
                return true;
              case "updated_at":
                return Math.floor(Date.now() / 1000);
              default:
                return null;
            }
          };

          for (const claimName of claimNames) {
            const value = setDevClaim(claimName);
            if (value !== null && value !== undefined) {
              synthesizedClaimsObj[claimName] = value;
            }
          }

          logger.info("Synthesized userinfo claims", { subject, claims: synthesizedClaimsObj });

          if (Object.keys(synthesizedClaimsObj).length === 0) {
            // Can't find subject information — respond with RFC6750-compatible error
            res.setHeader("WWW-Authenticate", 'Bearer error="invalid_token", error_description="The subject associated with the access token does not exist."');
            res.setHeader("Cache-Control", "no-store");
            res.setHeader("Pragma", "no-cache");
            return res.status(400).send({ error: "invalid_token", error_description: "The subject associated with the access token does not exist." });
          }

          // Build issue request for Authlete. `claims` must be a JSON string per
          // Authlete's UserinfoIssueRequest model. Include `token` from the
          // incoming Authorization header if present and `sub` explicitly.
          const token = (req.headers["authorization"] as string)?.replace(/^Bearer\s+/i, "") || "";
          const issueRequest: UserinfoIssueRequest = {
            token,
            sub: subject,
            claims: JSON.stringify(synthesizedClaimsObj),
          };

          try {
            const issueResponse = await userInfoService.issue(issueRequest);
            // `issueResponse` should contain the final content to return
            
            // Delegate response handling to the shared helper so the
            // same action handling logic is used as in the dedicated
            // userinfo-response controller.
            const { senduserInfoIssueResponse } = await import("./userinfo-issue-response.handler");
            return senduserInfoIssueResponse(res, issueResponse);

            // if ((issueResponse as any).responseContent) {
            //   res.setHeader("Content-Type", "application/json");
            //   return res.status(200).send((issueResponse as any).responseContent);
            // }
            // // If no responseContent, return the whole object
            // return res.status(200).send(issueResponse);
          } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            req.logger?.error("Failed to issue userinfo", { message: err.message });
            logger.error("Failed to issue userinfo", { message: err.message });
            res.setHeader("WWW-Authenticate", 'Bearer error="server_error", error_description="Failed to extract information about the subject from the database."');
            res.setHeader("Cache-Control", "no-store");
            res.setHeader("Pragma", "no-cache");
            return res.status(500).send({ error: "server_error", error_description: "Failed to extract information about the subject from the database." });
          }

        default:
          req.logger?.error("Unknown userinfo action", { action: result.action });
          logger.error("Unknown userinfo action", { action: result.action });
          return res.status(500).send("Unknown userinfo action");
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const log = req.logger || logger;
      log.error("UserInfo Response Error", { message: error.message });
      return next(error);
    }
  }
};
