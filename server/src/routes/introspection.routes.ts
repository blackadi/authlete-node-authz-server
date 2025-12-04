import { Router } from "express";
import { introspectionController } from "../controllers/introspection.controller";

const router = Router();

router.post("/introspection", introspectionController.handleIntrospection);

export default router;
