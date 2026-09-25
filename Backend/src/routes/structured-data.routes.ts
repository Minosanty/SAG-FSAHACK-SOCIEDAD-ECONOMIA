import { Router } from "express";
import { StructuredDataController } from "../controllers/structured-data.controller.js";

const router = Router();
const controller = new StructuredDataController();

router.post("/analyses/:analysisId/structured-data", controller.create);
router.get("/analyses/:analysisId/structured-data", controller.listByAnalysis);
router.get("/structured-data/:id", controller.getById);
router.put("/structured-data/:id", controller.update);
router.delete("/structured-data/:id", controller.remove);

export default router;
