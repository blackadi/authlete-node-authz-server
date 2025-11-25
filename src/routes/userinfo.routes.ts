import { Router } from "express";
import { userinfoController } from "../controllers/userinfo.controller";

const router = Router();

router.get("/userinfo", userinfoController.handleUserInfo);
router.post("/userinfo", userinfoController.handleUserInfo);


export default router;
