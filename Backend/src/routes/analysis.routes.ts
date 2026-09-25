import { Router } from "express";
import { AnalysisController } from "../controllers/analysis.controller.js";

const router = Router();

const controller = new AnalysisController();

router.post("/", controller.create);

router.get("/:id", controller.getById);

router.put("/:id", controller.update);

router.delete("/:id", controller.delete);

export default router;