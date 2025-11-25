import { Request, Response } from "express";
import { IntrospectionService } from "../services/introspection.service";

const introspectionService = new IntrospectionService();

export const introspectionController = {
  handleIntrospection: async (req: Request, res: Response) => {
    try {
      const result = await introspectionService.process(req);

      switch (result.action) {
        case "BAD_REQUEST":
          return res.status(400).send(result.responseContent);

        case "UNAUTHORIZED":
          return res.status(401).send(result.responseContent);

        case "INTERNAL_SERVER_ERROR":
          return res.status(500).send(result.responseContent);

        case "FORBIDDEN":
          res.setHeader("Content-Type", "application/json");
          return res.send(result.responseContent);

        case "OK":
          res.setHeader("Content-Type", "text/html");
          return res.send(result.responseContent);

        default:
          console.error("Unknown introspection action:", result.action);
          return res.status(500).send("Unknown introspection action");
      }
    } catch (error) {
      console.error("Introspection Error:", error);
      return res.status(500).send("Failed to process introspection.");
    }
  }
};
