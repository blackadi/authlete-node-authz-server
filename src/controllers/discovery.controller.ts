import { Request, Response } from "express";
import { DiscoveryService } from "../services/discovery.service";

const discoveryService = new DiscoveryService();

export class DiscoveryController {
  static async handle(req: Request, res: Response): Promise<void> {
    try {

      const result = await discoveryService.getConfiguration(req);

      res.status(200).send(result);
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: "server_error: " + err });
    }
  }
}
