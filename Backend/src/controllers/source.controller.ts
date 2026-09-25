import type { Request, Response } from "express";
import { SourceService } from "../services/source.service.js";

export class SourceController {
    private service: SourceService;

    constructor() {
        this.service = new SourceService();
    }

    createByAnalysis = async (req: Request, res: Response) => {
        try {
            const analysisId = req.params.analysisId;
            if (typeof analysisId !== "string") {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: "INVALID_ANALYSIS_ID",
                        message: "El identificador del análisis es inválido."
                    }
                });
            }

            const source = await this.service.createSource(analysisId, req.body);

            return res.status(201).json({
                success: true,
                data: source
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "INVALID_SOURCE",
                    message: error instanceof Error ? error.message : "No fue posible crear la source."
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
                    error: {
                        code: "INVALID_ANALYSIS_ID",
                        message: "El identificador del análisis es inválido."
                    }
                });
            }

            const sources = await this.service.listSourcesByAnalysis(analysisId);
            return res.json({ success: true, data: sources });
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "SOURCE_NOT_FOUND",
                    message: error instanceof Error ? error.message : "No fue posible listar las sources."
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
                        code: "INVALID_SOURCE",
                        message: "El identificador de la source es inválido."
                    }
                });
            }

            const source = await this.service.getSource(id);
            if (!source) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: "SOURCE_NOT_FOUND",
                        message: "No se encontró la source."
                    }
                });
            }

            return res.json({ success: true, data: source });
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "SOURCE_NOT_FOUND",
                    message: error instanceof Error ? error.message : "No fue posible obtener la source."
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
                        code: "INVALID_SOURCE",
                        message: "El identificador de la source es inválido."
                    }
                });
            }

            const source = await this.service.updateSource(id, req.body);
            if (!source) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: "SOURCE_NOT_FOUND",
                        message: "No se encontró la source."
                    }
                });
            }

            return res.json({ success: true, data: source });
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "INVALID_SOURCE",
                    message: error instanceof Error ? error.message : "No fue posible actualizar la source."
                }
            });
        }
    };

    remove = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            if (typeof id !== "string") {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: "INVALID_SOURCE",
                        message: "El identificador de la source es inválido."
                    }
                });
            }

            const source = await this.service.deleteSource(id);
            if (!source) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: "SOURCE_NOT_FOUND",
                        message: "No se encontró la source."
                    }
                });
            }

            return res.json({ success: true, data: source });
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "SOURCE_NOT_FOUND",
                    message: error instanceof Error ? error.message : "No fue posible eliminar la source."
                }
            });
        }
    };
}
