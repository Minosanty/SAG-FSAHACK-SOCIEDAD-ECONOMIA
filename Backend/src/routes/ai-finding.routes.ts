import { Router } from "express";
import { AiFindingController } from "../controllers/ai-finding.controller.js";

const router = Router();
const controller = new AiFindingController();

router.post("/analyses/:analysisId/findings", controller.create);
router.get("/analyses/:analysisId/findings", controller.listByAnalysis);
router.get("/findings/:id", controller.getById);
router.put("/findings/:id", controller.update);
router.delete("/findings/:id", controller.remove);

export default router;
