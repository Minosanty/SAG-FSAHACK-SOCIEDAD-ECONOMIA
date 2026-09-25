import { QualityResultRepository, type CreateQualityResultInput } from "../repositories/quality-result.repository.js";

export class QualityResultService {
    private repository: QualityResultRepository;

    constructor() {
        this.repository = new QualityResultRepository();
    }

    private isValidUuid(value: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
    }

    async createQualityResult(analysisId: string, payload: Partial<CreateQualityResultInput>) {
        if (!this.isValidUuid(analysisId)) {
            throw new Error("El identificador del análisis es inválido.");
        }

        return await this.repository.create({
            analysis_id: analysisId,
            inconsistencies: Array.isArray(payload.inconsistencies) ? payload.inconsistencies : [],
            missing_data: Array.isArray(payload.missing_data) ? payload.missing_data : [],
            duplicates: Array.isArray(payload.duplicates) ? payload.duplicates : [],
            format_errors: Array.isArray(payload.format_errors) ? payload.format_errors : [],
            outdated_sources: Array.isArray(payload.outdated_sources) ? payload.outdated_sources : []
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

    async updateQualityResult(id: string, payload: Partial<CreateQualityResultInput>) {
        if (!this.isValidUuid(id)) {
            throw new Error("El identificador es inválido.");
        }

        return await this.repository.update(id, payload);
    }

    async deleteQualityResult(id: string) {
        if (!this.isValidUuid(id)) {
            throw new Error("El identificador es inválido.");
        }

        return await this.repository.delete(id);
    }
}
