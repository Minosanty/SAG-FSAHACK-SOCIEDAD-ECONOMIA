import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller.js";

const router = Router();
const controller = new DashboardController();

router.get("/analyses/:id/results", controller.getResults);
router.get("/analyses/:id/dashboard", controller.getResults);

export default router;
