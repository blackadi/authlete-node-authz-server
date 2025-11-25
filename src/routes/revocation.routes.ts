import { Router } from "express";
import { RevocationController } from "../controllers/revocation.controller";

const router = Router();

router.post("/revocation", RevocationController.handle);

export default router;
