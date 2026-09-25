import type { Request, Response } from "express";
import { AiFindingService } from "../services/ai-finding.service.js";

export class AiFindingController {
    private service: AiFindingService;

    constructor() {
        this.service = new AiFindingService();
    }

    create = async (req: Request, res: Response) => {
        try {
            const analysisId = req.params.analysisId;
            if (typeof analysisId !== "string") {
                return res.status(400).json({ success: false, error: { code: "INVALID_ANALYSIS_ID", message: "El identificador del análisis es inválido." } });
            }

            const item = await this.service.createFinding(analysisId, req.body);
            return res.status(201).json({ success: true, data: item });
        } catch (error) {
            return res.status(400).json({ success: false, error: { code: "AI_ERROR", message: error instanceof Error ? error.message : "No fue posible crear el finding." } });
        }
    };

    listByAnalysis = async (req: Request, res: Response) => {
        try {
            const analysisId = req.params.analysisId;
            if (typeof analysisId !== "string") {
                return res.status(400).json({ success: false, error: { code: "INVALID_ANALYSIS_ID", message: "El identificador del análisis es inválido." } });
            }

            const items = await this.service.listByAnalysis(analysisId);
            return res.json({ success: true, data: items });
        } catch (error) {
            return res.status(400).json({ success: false, error: { code: "AI_ERROR", message: error instanceof Error ? error.message : "No fue posible listar findings." } });
        }
    };

    getById = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            if (typeof id !== "string") {
                return res.status(400).json({ success: false, error: { code: "INVALID_SOURCE", message: "El identificador es inválido." } });
            }

            const item = await this.service.getById(id);
            if (!item) {
                return res.status(404).json({ success: false, error: { code: "SOURCE_NOT_FOUND", message: "No se encontró el finding." } });
            }

            return res.json({ success: true, data: item });
        } catch (error) {
            return res.status(400).json({ success: false, error: { code: "AI_ERROR", message: error instanceof Error ? error.message : "No fue posible obtener el finding." } });
        }
    };

    update = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            if (typeof id !== "string") {
                return res.status(400).json({ success: false, error: { code: "INVALID_SOURCE", message: "El identificador es inválido." } });
            }

            const item = await this.service.updateFinding(id, req.body);
            if (!item) {
                return res.status(404).json({ success: false, error: { code: "SOURCE_NOT_FOUND", message: "No se encontró el finding." } });
            }

            return res.json({ success: true, data: item });
        } catch (error) {
            return res.status(400).json({ success: false, error: { code: "AI_ERROR", message: error instanceof Error ? error.message : "No fue posible actualizar el finding." } });
        }
    };

    remove = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            if (typeof id !== "string") {
                return res.status(400).json({ success: false, error: { code: "INVALID_SOURCE", message: "El identificador es inválido." } });
            }

            const item = await this.service.deleteFinding(id);
            if (!item) {
                return res.status(404).json({ success: false, error: { code: "SOURCE_NOT_FOUND", message: "No se encontró el finding." } });
            }

            return res.json({ success: true, data: item });
        } catch (error) {
            return res.status(400).json({ success: false, error: { code: "AI_ERROR", message: error instanceof Error ? error.message : "No fue posible eliminar el finding." } });
        }
    };
}
