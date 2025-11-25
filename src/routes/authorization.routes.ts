import { Router } from "express";
import { authorizationController } from "../controllers/authorization.controller";

const router = Router();

router.get("/authorization", authorizationController.handleAuthorization);
router.post("/authorization", authorizationController.handleAuthorization);

export default router;
