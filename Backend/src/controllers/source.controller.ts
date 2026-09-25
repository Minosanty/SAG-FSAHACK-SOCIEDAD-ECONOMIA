import type { Request, Response } from "express";
import { SourceService } from "../services/source.service.js";
import { N8nService } from "../services/n8n.service.js";
import { AnalysisRepository } from "../repositories/analysis.repository.js";

export class SourceController {
    private service: SourceService;
    private n8nService: N8nService;
    private analysisRepo: AnalysisRepository;

    constructor() {
        this.service = new SourceService();
        this.n8nService = new N8nService();
        this.analysisRepo = new AnalysisRepository();
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

            // Trigger n8n webhook asynchronously after source creation
            this.triggerN8nAnalysis(analysisId, source).catch((err) => {
                console.error("[n8n] Error al disparar el webhook:", err instanceof Error ? err.message : err);
            });

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

    private async triggerN8nAnalysis(analysisId: string, source: Record<string, unknown>) {
        try {
            // Update analysis status to 'processing'
            await this.analysisRepo.updateStatus(analysisId, "processing");

            // Send to n8n webhook
            await this.n8nService.triggerWorkflow("analizar-data", {
                analysis_id: analysisId,
                source_id: source.id,
                source_name: source.name,
                source_type: source.type,
                source_status: source.status,
                content: source.content,
                triggered_at: new Date().toISOString()
            });

            console.log(`[n8n] Webhook analizar-data disparado para análisis ${analysisId}`);
        } catch (error) {
            console.error(`[n8n] Fallo al procesar análisis ${analysisId}:`, error instanceof Error ? error.message : error);
            // Revert status on failure
            await this.analysisRepo.updateStatus(analysisId, "created").catch(() => {});
        }
    }

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
