import { Router } from "express";
import { DiscoveryController } from "../controllers/discovery.controller";

const router = Router();

router.get("/.well-known/openid-configuration", DiscoveryController.handle);

export default router;
