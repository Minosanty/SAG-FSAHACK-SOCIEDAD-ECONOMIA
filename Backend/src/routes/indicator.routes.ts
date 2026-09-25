import { Router } from "express";
import { IndicatorController } from "../controllers/indicator.controller.js";

const router = Router();
const controller = new IndicatorController();

router.post("/analyses/:analysisId/indicators", controller.create);
router.get("/analyses/:analysisId/indicators", controller.listByAnalysis);
router.get("/indicators/:id", controller.getById);
router.put("/indicators/:id", controller.update);
router.delete("/indicators/:id", controller.remove);

export default router;
