import { Router } from "express";
import { ComparisonController } from "../controllers/comparison.controller.js";

const router = Router();
const controller = new ComparisonController();

router.post("/analyses/:analysisId/comparisons", controller.create);
router.get("/analyses/:analysisId/comparisons", controller.listByAnalysis);
router.get("/comparisons/:id", controller.getById);
router.put("/comparisons/:id", controller.update);
router.delete("/comparisons/:id", controller.remove);

export default router;
