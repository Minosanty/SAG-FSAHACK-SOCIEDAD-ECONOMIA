import { Router } from "express";
import { AiReportController } from "../controllers/ai-report.controller.js";

const router = Router();
const controller = new AiReportController();

router.post("/analyses/:analysisId/reports", controller.create);
router.get("/analyses/:analysisId/reports", controller.listByAnalysis);
router.get("/reports/:id", controller.getById);
router.put("/reports/:id", controller.update);
router.delete("/reports/:id", controller.remove);

export default router;
