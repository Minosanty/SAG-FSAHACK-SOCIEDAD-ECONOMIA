import { Router } from "express";
import { WorkflowController } from "../controllers/workflow.controller.js";

const router = Router();
const controller = new WorkflowController();

router.post("/workflows/:workflowName", controller.trigger);
router.post("/workflows", controller.trigger);

export default router;
