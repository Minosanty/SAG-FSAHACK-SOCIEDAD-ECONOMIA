import type { Request, Response } from "express";
import { AiReportService } from "../services/ai-report.service.js";

export class AiReportController {
    private service: AiReportService;

    constructor() {
        this.service = new AiReportService();
    }

    create = async (req: Request, res: Response) => {
        try {
            const analysisId = req.params.analysisId;
            if (typeof analysisId !== "string") {
                return res.status(400).json({ success: false, error: { code: "INVALID_ANALYSIS_ID", message: "El identificador del análisis es inválido." } });
            }

            const item = await this.service.createReport(analysisId, req.body);
            return res.status(201).json({ success: true, data: item });
        } catch (error) {
            return res.status(400).json({ success: false, error: { code: "AI_ERROR", message: error instanceof Error ? error.message : "No fue posible crear el informe." } });
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
            return res.status(400).json({ success: false, error: { code: "AI_ERROR", message: error instanceof Error ? error.message : "No fue posible listar informes." } });
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
                return res.status(404).json({ success: false, error: { code: "SOURCE_NOT_FOUND", message: "No se encontró el informe." } });
            }

            return res.json({ success: true, data: item });
        } catch (error) {
            return res.status(400).json({ success: false, error: { code: "AI_ERROR", message: error instanceof Error ? error.message : "No fue posible obtener el informe." } });
        }
    };

    update = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            if (typeof id !== "string") {
                return res.status(400).json({ success: false, error: { code: "INVALID_SOURCE", message: "El identificador es inválido." } });
            }

            const item = await this.service.updateReport(id, req.body);
            if (!item) {
                return res.status(404).json({ success: false, error: { code: "SOURCE_NOT_FOUND", message: "No se encontró el informe." } });
            }

            return res.json({ success: true, data: item });
        } catch (error) {
            return res.status(400).json({ success: false, error: { code: "AI_ERROR", message: error instanceof Error ? error.message : "No fue posible actualizar el informe." } });
        }
    };

    remove = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            if (typeof id !== "string") {
                return res.status(400).json({ success: false, error: { code: "INVALID_SOURCE", message: "El identificador es inválido." } });
            }

            const item = await this.service.deleteReport(id);
            if (!item) {
                return res.status(404).json({ success: false, error: { code: "SOURCE_NOT_FOUND", message: "No se encontró el informe." } });
            }

            return res.json({ success: true, data: item });
        } catch (error) {
            return res.status(400).json({ success: false, error: { code: "AI_ERROR", message: error instanceof Error ? error.message : "No fue posible eliminar el informe." } });
        }
    };
}
