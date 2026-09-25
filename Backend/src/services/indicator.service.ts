import { IndicatorRepository, type CreateIndicatorInput } from "../repositories/indicator.repository.js";

const INDICATOR_TYPES = new Set(["SUM", "AVG", "MIN", "MAX", "COUNT", "PERCENTAGE", "VARIATION"]);

export class IndicatorService {
    private repository: IndicatorRepository;

    constructor() {
        this.repository = new IndicatorRepository();
    }

    private isValidUuid(value: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
    }

    async createIndicator(analysisId: string, payload: Partial<CreateIndicatorInput>) {
        if (!this.isValidUuid(analysisId)) {
            throw new Error("El identificador del análisis es inválido.");
        }

        const name = typeof payload.name === "string" ? payload.name.trim() : "";
        const type = typeof payload.name === "string" ? payload.name.trim().toUpperCase() : "";

        if (!name) {
            throw new Error("El nombre del indicador es obligatorio.");
        }

        if (!INDICATOR_TYPES.has(type)) {
            throw new Error("El tipo del indicador no es válido.");
        }

        return await this.repository.create({
            analysis_id: analysisId,
            name: type,
            value: typeof payload.value === "number" ? payload.value : null,
            unit: typeof payload.unit === "string" ? payload.unit : null,
            calculation: typeof payload.calculation === "string" ? payload.calculation : null,
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
            throw new Error("El identificador del indicador es inválido.");
        }

        return await this.repository.findById(id);
    }

    async updateIndicator(id: string, payload: Partial<CreateIndicatorInput>) {
        if (!this.isValidUuid(id)) {
            throw new Error("El identificador del indicador es inválido.");
        }

        if (payload.name !== undefined) {
            const value = payload.name.trim();
            if (!value) {
                throw new Error("El nombre del indicador es obligatorio.");
            }
            if (!INDICATOR_TYPES.has(value.toUpperCase())) {
                throw new Error("El tipo del indicador no es válido.");
            }
        }

        return await this.repository.update(id, payload);
    }

    async deleteIndicator(id: string) {
        if (!this.isValidUuid(id)) {
            throw new Error("El identificador del indicador es inválido.");
        }

        return await this.repository.delete(id);
    }
}
