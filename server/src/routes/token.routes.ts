import { Router } from "express";
import { tokenController } from "../controllers/token.controller";
import { tokenIssueController } from "../controllers/token-issue.controller";
import { tokenFailController } from "../controllers/token-fail.controller";

const router = Router();

router.post("/token", tokenController.handleToken);
router.post("/token/issue", tokenIssueController.handleIssue);
router.post("/token/fail", tokenFailController.handleFail);

export default router;
