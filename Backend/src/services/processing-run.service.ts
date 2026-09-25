import { ProcessingRunRepository, type CreateProcessingRunInput } from "../repositories/processing-run.repository.js";

const VALID_STAGES = new Set(["ingestion", "normalization", "quality", "indicators", "analysis", "synthesis", "storage", "completed"]);
const VALID_STATUSES = new Set(["pending", "processing", "completed", "error"]);

export class ProcessingRunService {
    private repository: ProcessingRunRepository;

    constructor() {
        this.repository = new ProcessingRunRepository();
    }

    private isValidUuid(value: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
    }

    async createRun(analysisId: string, payload: Partial<CreateProcessingRunInput>) {
        if (!this.isValidUuid(analysisId)) {
            throw new Error("El identificador del análisis es inválido.");
        }

        const stage = typeof payload.stage === "string" ? payload.stage.trim().toLowerCase() : "";
        if (!stage || !VALID_STAGES.has(stage)) {
            throw new Error("La etapa de procesamiento no es válida.");
        }

        const status = typeof payload.status === "string" ? payload.status.trim().toLowerCase() : "pending";
        if (!VALID_STATUSES.has(status)) {
            throw new Error("El estado de procesamiento no es válido.");
        }

        return await this.repository.create({
            analysis_id: analysisId,
            stage,
            status,
            error_message: typeof payload.error_message === "string" ? payload.error_message : null,
            started_at: payload.started_at ?? new Date(),
            finished_at: payload.finished_at ?? null
        });
    }

    async listByAnalysis(analysisId: string) {
        if (!this.isValidUuid(analysisId)) {
            throw new Error("El identificador del análisis es inválido.");
        }

        return await this.repository.findByAnalysisId(analysisId);
    }

    async getById(id: string) {
        if (!this.isValidUuid(id)) {
            throw new Error("El identificador es inválido.");
        }

        return await this.repository.findById(id);
    }

    async updateRun(id: string, payload: Partial<CreateProcessingRunInput>) {
        if (!this.isValidUuid(id)) {
            throw new Error("El identificador es inválido.");
        }

        if (payload.stage !== undefined) {
            const stage = payload.stage.trim().toLowerCase();
            if (!VALID_STAGES.has(stage)) {
                throw new Error("La etapa de procesamiento no es válida.");
            }
            payload.stage = stage;
        }

        if (payload.status !== undefined) {
            const status = payload.status.trim().toLowerCase();
            if (!VALID_STATUSES.has(status)) {
                throw new Error("El estado de procesamiento no es válido.");
            }
            payload.status = status;
        }

        return await this.repository.update(id, payload);
    }

    async deleteRun(id: string) {
        if (!this.isValidUuid(id)) {
            throw new Error("El identificador es inválido.");
        }

        return await this.repository.delete(id);
    }
}
