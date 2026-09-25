import type { Request, Response } from "express";
import { StructuredDataService } from "../services/structured-data.service.js";

export class StructuredDataController {
    private service: StructuredDataService;

    constructor() {
        this.service = new StructuredDataService();
    }

    create = async (req: Request, res: Response) => {
        try {
            const analysisId = req.params.analysisId;
            const sourceId = req.params.sourceId ?? req.body.source_id;

            if (typeof analysisId !== "string" || typeof sourceId !== "string") {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: "INVALID_SOURCE",
                        message: "Los identificadores son inválidos."
                    }
                });
            }

            const item = await this.service.createStructuredData(analysisId, sourceId, req.body.data ?? req.body);
            return res.status(201).json({ success: true, data: item });
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "NORMALIZATION_ERROR",
                    message: error instanceof Error ? error.message : "No fue posible crear structured data."
                }
            });
        }
    };

    listByAnalysis = async (req: Request, res: Response) => {
        try {
            const analysisId = req.params.analysisId;
            if (typeof analysisId !== "string") {
                return res.status(400).json({
                    success: false,
                    error: { code: "INVALID_ANALYSIS_ID", message: "El identificador del análisis es inválido." }
                });
            }

            const items = await this.service.getByAnalysis(analysisId);
            return res.json({ success: true, data: items });
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: { code: "NORMALIZATION_ERROR", message: error instanceof Error ? error.message : "No fue posible listar structured data." }
            });
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
                return res.status(404).json({ success: false, error: { code: "SOURCE_NOT_FOUND", message: "No se encontró el registro." } });
            }

            return res.json({ success: true, data: item });
        } catch (error) {
            return res.status(400).json({ success: false, error: { code: "NORMALIZATION_ERROR", message: error instanceof Error ? error.message : "No fue posible obtener el registro." } });
        }
    };

    update = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            if (typeof id !== "string") {
                return res.status(400).json({ success: false, error: { code: "INVALID_SOURCE", message: "El identificador es inválido." } });
            }

            const item = await this.service.updateStructuredData(id, req.body);
            if (!item) {
                return res.status(404).json({ success: false, error: { code: "SOURCE_NOT_FOUND", message: "No se encontró el registro." } });
            }

            return res.json({ success: true, data: item });
        } catch (error) {
            return res.status(400).json({ success: false, error: { code: "NORMALIZATION_ERROR", message: error instanceof Error ? error.message : "No fue posible actualizar el registro." } });
        }
    };

    remove = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            if (typeof id !== "string") {
                return res.status(400).json({ success: false, error: { code: "INVALID_SOURCE", message: "El identificador es inválido." } });
            }

            const item = await this.service.deleteStructuredData(id);
            if (!item) {
                return res.status(404).json({ success: false, error: { code: "SOURCE_NOT_FOUND", message: "No se encontró el registro." } });
            }

            return res.json({ success: true, data: item });
        } catch (error) {
            return res.status(400).json({ success: false, error: { code: "NORMALIZATION_ERROR", message: error instanceof Error ? error.message : "No fue posible eliminar el registro." } });
        }
    };
}
