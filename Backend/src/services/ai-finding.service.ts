import { AiFindingRepository, type CreateAiFindingInput } from "../repositories/ai-finding.repository.js";

const FINDING_TYPES = new Set(["trend", "pattern", "comparison", "relationship", "anomaly", "observation"]);

export class AiFindingService {
    private repository: AiFindingRepository;

    constructor() {
        this.repository = new AiFindingRepository();
    }

    private isValidUuid(value: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
    }

    async createFinding(analysisId: string, payload: Partial<CreateAiFindingInput>) {
        if (!this.isValidUuid(analysisId)) {
            throw new Error("El identificador del análisis es inválido.");
        }

        const description = typeof payload.description === "string" ? payload.description.trim() : "";
        if (!description) {
            throw new Error("La descripción del finding es obligatoria.");
        }

        const type = typeof payload.type === "string" ? payload.type.toLowerCase() : "";
        if (payload.type !== undefined && !FINDING_TYPES.has(type)) {
            throw new Error("El tipo de finding no es válido.");
        }

        return await this.repository.create({
            analysis_id: analysisId,
            description,
            type: payload.type ? payload.type.toLowerCase() : null,
            evidence: payload.evidence ?? null,
            source_ids: Array.isArray(payload.source_ids) ? payload.source_ids : null
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

    async updateFinding(id: string, payload: Partial<CreateAiFindingInput>) {
        if (!this.isValidUuid(id)) {
            throw new Error("El identificador es inválido.");
        }

        if (payload.description !== undefined && !payload.description.trim()) {
            throw new Error("La descripción del finding es obligatoria.");
        }

        if (payload.type !== undefined && payload.type !== null && payload.type !== null && !FINDING_TYPES.has(payload.type.toLowerCase())) {
            throw new Error("El tipo de finding no es válido.");
        }

        return await this.repository.update(id, payload);
    }

    async deleteFinding(id: string) {
        if (!this.isValidUuid(id)) {
            throw new Error("El identificador es inválido.");
        }

        return await this.repository.delete(id);
    }
}
