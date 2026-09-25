import { AiReportRepository, type CreateAiReportInput } from "../repositories/ai-report.repository.js";

export class AiReportService {
    private repository: AiReportRepository;

    constructor() {
        this.repository = new AiReportRepository();
    }

    private isValidUuid(value: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
    }

    async createReport(analysisId: string, payload: Partial<CreateAiReportInput>) {
        if (!this.isValidUuid(analysisId)) {
            throw new Error("El identificador del análisis es inválido.");
        }

        return await this.repository.create({
            analysis_id: analysisId,
            summary: typeof payload.summary === "string" ? payload.summary : null,
            findings: Array.isArray(payload.findings) ? payload.findings : [],
            possible_needs: Array.isArray(payload.possible_needs) ? payload.possible_needs : [],
            additional_information: Array.isArray(payload.additional_information) ? payload.additional_information : [],
            questions: Array.isArray(payload.questions) ? payload.questions : []
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

    async updateReport(id: string, payload: Partial<CreateAiReportInput>) {
        if (!this.isValidUuid(id)) {
            throw new Error("El identificador es inválido.");
        }

        return await this.repository.update(id, payload);
    }

    async deleteReport(id: string) {
        if (!this.isValidUuid(id)) {
            throw new Error("El identificador es inválido.");
        }

        return await this.repository.delete(id);
    }
}
