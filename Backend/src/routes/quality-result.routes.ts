import { Router } from "express";
import { QualityResultController } from "../controllers/quality-result.controller.js";

const router = Router();
const controller = new QualityResultController();

router.post("/analyses/:analysisId/quality-results", controller.create);
router.get("/analyses/:analysisId/quality-results", controller.listByAnalysis);
router.get("/quality-results/:id", controller.getById);
router.put("/quality-results/:id", controller.update);
router.delete("/quality-results/:id", controller.remove);

export default router;
