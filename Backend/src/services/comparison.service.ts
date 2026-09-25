import { ComparisonRepository, type CreateComparisonInput } from "../repositories/comparison.repository.js";

export class ComparisonService {
    private repository: ComparisonRepository;

    constructor() {
        this.repository = new ComparisonRepository();
    }

    private isValidUuid(value: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
    }

    async createComparison(analysisId: string, payload: Partial<CreateComparisonInput>) {
        if (!this.isValidUuid(analysisId)) {
            throw new Error("El identificador del análisis es inválido.");
        }

        const variable = typeof payload.variable === "string" ? payload.variable.trim() : "";
        if (!variable) {
            throw new Error("La variable es obligatoria.");
        }

        if (!payload.source_a || typeof payload.source_a !== "object") {
            throw new Error("La fuente A es obligatoria.");
        }

        if (!payload.source_b || typeof payload.source_b !== "object") {
            throw new Error("La fuente B es obligatoria.");
        }

        return await this.repository.create({
            analysis_id: analysisId,
            variable,
            source_a: payload.source_a,
            source_b: payload.source_b,
            difference: typeof payload.difference === "number" ? payload.difference : null,
            percentage_difference: typeof payload.percentage_difference === "number" ? payload.percentage_difference : null
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

    async updateComparison(id: string, payload: Partial<CreateComparisonInput>) {
        if (!this.isValidUuid(id)) {
            throw new Error("El identificador es inválido.");
        }

        if (payload.variable !== undefined && !payload.variable.trim()) {
            throw new Error("La variable es obligatoria.");
        }

        return await this.repository.update(id, payload);
    }

    async deleteComparison(id: string) {
        if (!this.isValidUuid(id)) {
            throw new Error("El identificador es inválido.");
        }

        return await this.repository.delete(id);
    }
}
