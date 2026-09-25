import type { Request, Response } from "express";
import { ComparisonService } from "../services/comparison.service.js";

export class ComparisonController {
    private service: ComparisonService;

    constructor() {
        this.service = new ComparisonService();
    }

    create = async (req: Request, res: Response) => {
        try {
            const analysisId = req.params.analysisId;
            if (typeof analysisId !== "string") {
                return res.status(400).json({ success: false, error: { code: "INVALID_ANALYSIS_ID", message: "El identificador del análisis es inválido." } });
            }

            const item = await this.service.createComparison(analysisId, req.body);
            return res.status(201).json({ success: true, data: item });
        } catch (error) {
            return res.status(400).json({ success: false, error: { code: "CALCULATION_ERROR", message: error instanceof Error ? error.message : "No fue posible crear la comparación." } });
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
            return res.status(400).json({ success: false, error: { code: "CALCULATION_ERROR", message: error instanceof Error ? error.message : "No fue posible listar comparaciones." } });
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
                return res.status(404).json({ success: false, error: { code: "SOURCE_NOT_FOUND", message: "No se encontró la comparación." } });
            }

            return res.json({ success: true, data: item });
        } catch (error) {
            return res.status(400).json({ success: false, error: { code: "CALCULATION_ERROR", message: error instanceof Error ? error.message : "No fue posible obtener la comparación." } });
        }
    };

    update = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            if (typeof id !== "string") {
                return res.status(400).json({ success: false, error: { code: "INVALID_SOURCE", message: "El identificador es inválido." } });
            }

            const item = await this.service.updateComparison(id, req.body);
            if (!item) {
                return res.status(404).json({ success: false, error: { code: "SOURCE_NOT_FOUND", message: "No se encontró la comparación." } });
            }

            return res.json({ success: true, data: item });
        } catch (error) {
            return res.status(400).json({ success: false, error: { code: "CALCULATION_ERROR", message: error instanceof Error ? error.message : "No fue posible actualizar la comparación." } });
        }
    };

    remove = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            if (typeof id !== "string") {
                return res.status(400).json({ success: false, error: { code: "INVALID_SOURCE", message: "El identificador es inválido." } });
            }

            const item = await this.service.deleteComparison(id);
            if (!item) {
                return res.status(404).json({ success: false, error: { code: "SOURCE_NOT_FOUND", message: "No se encontró la comparación." } });
            }

            return res.json({ success: true, data: item });
        } catch (error) {
            return res.status(400).json({ success: false, error: { code: "CALCULATION_ERROR", message: error instanceof Error ? error.message : "No fue posible eliminar la comparación." } });
        }
    };
}
