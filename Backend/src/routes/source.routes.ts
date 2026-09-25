import { Router } from "express";
import { SourceController } from "../controllers/source.controller.js";

const router = Router();
const controller = new SourceController();

router.post("/analyses/:analysisId/sources", controller.createByAnalysis);
router.get("/analyses/:analysisId/sources", controller.listByAnalysis);
router.get("/sources/:id", controller.getById);
router.put("/sources/:id", controller.update);
router.delete("/sources/:id", controller.remove);

export default router;
