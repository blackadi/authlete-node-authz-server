import { Router } from "express";
import { JwksController } from "../controllers/jwks.controller";

const router = Router();

router.get("/.well-known/jwks.json", JwksController.handle);

export default router;
