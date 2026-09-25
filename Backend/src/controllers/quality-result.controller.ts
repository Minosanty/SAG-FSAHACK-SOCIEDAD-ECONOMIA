import type { Request, Response } from "express";
import { QualityResultService } from "../services/quality-result.service.js";

export class QualityResultController {
    private service: QualityResultService;

    constructor() {
        this.service = new QualityResultService();
    }

    create = async (req: Request, res: Response) => {
        try {
            const analysisId = req.params.analysisId;
            if (typeof analysisId !== "string") {
                return res.status(400).json({ success: false, error: { code: "INVALID_ANALYSIS_ID", message: "El identificador del análisis es inválido." } });
            }

            const item = await this.service.createQualityResult(analysisId, req.body);
            return res.status(201).json({ success: true, data: item });
        } catch (error) {
            return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: error instanceof Error ? error.message : "No fue posible crear el resultado de calidad." } });
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
            return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: error instanceof Error ? error.message : "No fue posible listar resultados de calidad." } });
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
                return res.status(404).json({ success: false, error: { code: "SOURCE_NOT_FOUND", message: "No se encontró el resultado de calidad." } });
            }

            return res.json({ success: true, data: item });
        } catch (error) {
            return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: error instanceof Error ? error.message : "No fue posible obtener el resultado de calidad." } });
        }
    };

    update = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            if (typeof id !== "string") {
                return res.status(400).json({ success: false, error: { code: "INVALID_SOURCE", message: "El identificador es inválido." } });
            }

            const item = await this.service.updateQualityResult(id, req.body);
            if (!item) {
                return res.status(404).json({ success: false, error: { code: "SOURCE_NOT_FOUND", message: "No se encontró el resultado de calidad." } });
            }

            return res.json({ success: true, data: item });
        } catch (error) {
            return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: error instanceof Error ? error.message : "No fue posible actualizar el resultado de calidad." } });
        }
    };

    remove = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            if (typeof id !== "string") {
                return res.status(400).json({ success: false, error: { code: "INVALID_SOURCE", message: "El identificador es inválido." } });
            }

            const item = await this.service.deleteQualityResult(id);
            if (!item) {
                return res.status(404).json({ success: false, error: { code: "SOURCE_NOT_FOUND", message: "No se encontró el resultado de calidad." } });
            }

            return res.json({ success: true, data: item });
        } catch (error) {
            return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: error instanceof Error ? error.message : "No fue posible eliminar el resultado de calidad." } });
        }
    };
}
