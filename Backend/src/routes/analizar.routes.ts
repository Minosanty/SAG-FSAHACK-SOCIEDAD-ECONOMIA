import { Router } from "express";
import multer from "multer";
import { AnalizarController } from "../controllers/analizar.controller.js";

const router = Router();
const controller = new AnalizarController();

// Configuramos multer en memoria ya que solo reenviamos el buffer a n8n
const upload = multer({ storage: multer.memoryStorage() });

router.post("/analizar", upload.single("data"), controller.procesarArchivo);

export default router;
