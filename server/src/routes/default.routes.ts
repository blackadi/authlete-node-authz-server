import { Router } from "express";
import { defaultController } from "../controllers/default.controller";

const router = Router();

router.get("*", defaultController.handleDefault);

export default router;
