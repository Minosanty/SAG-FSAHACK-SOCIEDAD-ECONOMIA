import type { Request, Response } from "express";
import { AnalysisService } from "../services/analysis.service.js";

export class AnalysisController {

    private service: AnalysisService;

    constructor() {
        this.service = new AnalysisService();
    }

    create = async (req: Request, res: Response) => {

        try {

            const { name, description } = req.body;

            const analysis = await this.service.createAnalysis(
                name,
                description
            );

            return res.status(201).json({
                analysis_id: analysis.id,
                name: analysis.name,
                description: analysis.description,
                status: analysis.status,
                created_at: analysis.created_at
            });

        } catch (error) {

            console.error(error);

            return res.status(400).json({
                success: false,
                error: {
                    code: "CREATE_ANALYSIS_ERROR",
                    message: error instanceof Error
                        ? error.message
                        : "No fue posible crear el análisis."
                }
            });
        }
    };

    getById = async (req: Request, res: Response) => {

        try {

            const id = req.params.id;

            if (typeof id !== "string") {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: "INVALID_ANALYSIS_ID",
                        message: "El identificador del análisis es inválido."
                    }
                });
            }

            const analysis = await this.service.getAnalysis(id);

            if (!analysis) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: "ANALYSIS_NOT_FOUND",
                        message: "No se encontró el análisis."
                    }
                });
            }

            return res.json({
                analysis_id: analysis.id,
                name: analysis.name,
                description: analysis.description,
                status: analysis.status,
                created_at: analysis.created_at,
                updated_at: analysis.updated_at
            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                success: false,
                error: {
                    code: "GET_ANALYSIS_ERROR",
                    message: "No fue posible obtener el análisis."
                }
            });
        }
    };

    update = async (req: Request, res: Response) => {

        try {

            const id = req.params.id;

            if (typeof id !== "string") {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: "INVALID_ANALYSIS_ID",
                        message: "El identificador del análisis es inválido."
                    }
                });
            }

            const { name, description } = req.body;

            const analysis = await this.service.updateAnalysis(
                id,
                name,
                description
            );

            if (!analysis) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: "ANALYSIS_NOT_FOUND",
                        message: "No se encontró el análisis."
                    }
                });
            }

            return res.json({
                analysis_id: analysis.id,
                name: analysis.name,
                description: analysis.description,
                status: analysis.status,
                created_at: analysis.created_at,
                updated_at: analysis.updated_at
            });

        } catch (error) {

            console.error(error);

            return res.status(400).json({
                success: false,
                error: {
                    code: "UPDATE_ANALYSIS_ERROR",
                    message: error instanceof Error
                        ? error.message
                        : "No fue posible actualizar el análisis."
                }
            });
        }
    };

    delete = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;

            if (typeof id !== "string") {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: "INVALID_ANALYSIS_ID",
                        message: "El identificador del análisis es inválido."
                    }
                });
            }

            const analysis = await this.service.deleteAnalysis(id);

            if (!analysis) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: "ANALYSIS_NOT_FOUND",
                        message: "No se encontró el análisis."
                    }
                });
            }

            return res.json({
                success: true,
                data: analysis
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: {
                    code: "DATABASE_ERROR",
                    message: error instanceof Error ? error.message : "No fue posible eliminar el análisis."
                }
            });
        }
    };
}