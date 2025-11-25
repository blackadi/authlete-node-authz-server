import { Request, Response } from "express";
import { JwksService } from "../services/jwks.service";

const jwksService = new JwksService();

export class JwksController {
  static async handle(req: Request, res: Response): Promise<void> {
    try {

      const result = await jwksService.serviceJwksGetApi();

      res.status(200).send(result);
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: "server_error: " + err });
    }
  }
}
