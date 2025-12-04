import { Router } from "express";
import { tokenController } from "../controllers/token.controller";

const router = Router();

router.post("/token", tokenController.handleToken);

export default router;
