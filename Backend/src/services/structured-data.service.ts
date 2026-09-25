import { StructuredDataRepository, type CreateStructuredDataInput } from "../repositories/structured-data.repository.js";

export class StructuredDataService {
    private repository: StructuredDataRepository;

    constructor() {
        this.repository = new StructuredDataRepository();
    }

    private isValidUuid(value: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
    }

    async createStructuredData(analysisId: string, sourceId: string, data: Record<string, unknown>) {
        if (!this.isValidUuid(analysisId) || !this.isValidUuid(sourceId)) {
            throw new Error("Los identificadores son inválidos.");
        }

        if (!data || typeof data !== "object") {
            throw new Error("La información estructurada es obligatoria.");
        }

        return await this.repository.create({
            analysis_id: analysisId,
            source_id: sourceId,
            data
        });
    }

    async getByAnalysis(analysisId: string) {
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

    async updateStructuredData(id: string, patch: Partial<CreateStructuredDataInput>) {
        if (!this.isValidUuid(id)) {
            throw new Error("El identificador es inválido.");
        }

        if (patch.source_id !== undefined && !this.isValidUuid(patch.source_id)) {
            throw new Error("El identificador de la source es inválido.");
        }

        return await this.repository.update(id, {
            ...(patch.source_id !== undefined ? { source_id: patch.source_id } : {}),
            ...(patch.data !== undefined ? { data: patch.data } : {})
        });
    }

    async deleteStructuredData(id: string) {
        if (!this.isValidUuid(id)) {
            throw new Error("El identificador es inválido.");
        }

        return await this.repository.delete(id);
    }
}
