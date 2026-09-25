import type { Request, Response } from "express";
import { ProcessingRunService } from "../services/processing-run.service.js";

export class ProcessingRunController {
    private service: ProcessingRunService;

    constructor() {
        this.service = new ProcessingRunService();
    }

    create = async (req: Request, res: Response) => {
        try {
            const analysisId = req.params.analysisId;
            if (typeof analysisId !== "string") {
                return res.status(400).json({ success: false, error: { code: "INVALID_ANALYSIS_ID", message: "El identificador del análisis es inválido." } });
            }

            const item = await this.service.createRun(analysisId, req.body);
            return res.status(201).json({ success: true, data: item });
        } catch (error) {
            return res.status(400).json({ success: false, error: { code: "WORKFLOW_ERROR", message: error instanceof Error ? error.message : "No fue posible registrar el procesamiento." } });
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
            return res.status(400).json({ success: false, error: { code: "WORKFLOW_ERROR", message: error instanceof Error ? error.message : "No fue posible listar processing runs." } });
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
                return res.status(404).json({ success: false, error: { code: "SOURCE_NOT_FOUND", message: "No se encontró el procesamiento." } });
            }

            return res.json({ success: true, data: item });
        } catch (error) {
            return res.status(400).json({ success: false, error: { code: "WORKFLOW_ERROR", message: error instanceof Error ? error.message : "No fue posible obtener el procesamiento." } });
        }
    };

    update = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            if (typeof id !== "string") {
                return res.status(400).json({ success: false, error: { code: "INVALID_SOURCE", message: "El identificador es inválido." } });
            }

            const item = await this.service.updateRun(id, req.body);
            if (!item) {
                return res.status(404).json({ success: false, error: { code: "SOURCE_NOT_FOUND", message: "No se encontró el procesamiento." } });
            }

            return res.json({ success: true, data: item });
        } catch (error) {
            return res.status(400).json({ success: false, error: { code: "WORKFLOW_ERROR", message: error instanceof Error ? error.message : "No fue posible actualizar el procesamiento." } });
        }
    };

    remove = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            if (typeof id !== "string") {
                return res.status(400).json({ success: false, error: { code: "INVALID_SOURCE", message: "El identificador es inválido." } });
            }

            const item = await this.service.deleteRun(id);
            if (!item) {
                return res.status(404).json({ success: false, error: { code: "SOURCE_NOT_FOUND", message: "No se encontró el procesamiento." } });
            }

            return res.json({ success: true, data: item });
        } catch (error) {
            return res.status(400).json({ success: false, error: { code: "WORKFLOW_ERROR", message: error instanceof Error ? error.message : "No fue posible eliminar el procesamiento." } });
        }
    };
}
