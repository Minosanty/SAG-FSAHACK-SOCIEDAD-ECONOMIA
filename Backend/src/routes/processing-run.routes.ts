import { Router } from "express";
import { ProcessingRunController } from "../controllers/processing-run.controller.js";

const router = Router();
const controller = new ProcessingRunController();

router.post("/analyses/:analysisId/processing-runs", controller.create);
router.get("/analyses/:analysisId/processing-runs", controller.listByAnalysis);
router.get("/processing-runs/:id", controller.getById);
router.put("/processing-runs/:id", controller.update);
router.delete("/processing-runs/:id", controller.remove);

export default router;
