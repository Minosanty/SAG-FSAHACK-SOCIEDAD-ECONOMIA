import type { Request, Response } from "express";
import axios from "axios";
import FormData from "form-data";

export class AnalizarController {
    procesarArchivo = async (req: Request, res: Response) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "No se recibió archivo en el campo 'data'." });
            }

            const webhookUrl = process.env.N8N_WEBHOOK_URL || "http://localhost:5678/webhook/analizar-data";

            const form = new FormData();
            form.append("data", req.file.buffer, {
                filename: req.file.originalname,
                contentType: req.file.mimetype
            });

            const respuesta = await axios.post(webhookUrl, form, {
                headers: form.getHeaders(),
                maxBodyLength: Infinity,
            });

            return res.json(respuesta.data);

        } catch (error) {
            console.error("[AnalizarController] Error:", error);
            
            if (axios.isAxiosError(error)) {
                return res.status(502).json({
                    error: "Error procesando el archivo en n8n",
                    details: error.response?.data || error.message
                });
            }

            return res.status(500).json({
                error: "Error enviando archivo a n8n",
                details: error instanceof Error ? error.message : "Desconocido"
            });
        }
    };
}
