import { SourceRepository, type CreateSourceData, type UpdateSourceData } from "../repositories/source.repository.js";

const SOURCE_TYPES = new Set(["pdf", "csv", "excel", "url", "text"]);
const SOURCE_STATUSES = new Set(["pending", "processing", "processed", "error"]);

export class SourceService {
    private repository: SourceRepository;

    constructor() {
        this.repository = new SourceRepository();
    }

    private isValidUuid(value: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
    }

    async createSource(analysisId: string, data: Partial<CreateSourceData>) {
        if (!this.isValidUuid(analysisId)) {
            throw new Error("El identificador del análisis es inválido.");
        }

        const name = typeof data.name === "string" ? data.name.trim() : "";
        const type = typeof data.type === "string" ? data.type.toLowerCase() : "";

        if (!name) {
            throw new Error("El nombre de la fuente es obligatorio.");
        }

        if (!SOURCE_TYPES.has(type)) {
            throw new Error("El tipo de source no es válido.");
        }

        if (data.status && !SOURCE_STATUSES.has(data.status)) {
            throw new Error("El estado de la source no es válido.");
        }

        const payload: CreateSourceData = {
            analysis_id: analysisId,
            name,
            type,
            ...(typeof data.location === "string" ? { location: data.location } : {}),
            content: data.content ?? null,
            status: data.status ?? "pending"
        };

        return await this.repository.create(payload);
    }

    async listSourcesByAnalysis(analysisId: string) {
        if (!this.isValidUuid(analysisId)) {
            throw new Error("El identificador del análisis es inválido.");
        }

        return await this.repository.findByAnalysisId(analysisId);
    }

    async getSource(id: string) {
        if (!this.isValidUuid(id)) {
            throw new Error("El identificador de la source es inválido.");
        }

        return await this.repository.findById(id);
    }

    async updateSource(id: string, data: UpdateSourceData) {
        if (!this.isValidUuid(id)) {
            throw new Error("El identificador de la source es inválido.");
        }

        if (data.name !== undefined && !data.name.trim()) {
            throw new Error("El nombre de la source es obligatorio.");
        }

        if (data.type !== undefined && !SOURCE_TYPES.has(data.type.toLowerCase())) {
            throw new Error("El tipo de source no es válido.");
        }

        if (data.status !== undefined && !SOURCE_STATUSES.has(data.status)) {
            throw new Error("El estado de la source no es válido.");
        }

        const payload: UpdateSourceData = {
            ...(data.name !== undefined ? { name: data.name.trim() } : {}),
            ...(data.type !== undefined ? { type: data.type.toLowerCase() } : {}),
            ...(data.location !== undefined ? { location: data.location } : {}),
            ...(data.content !== undefined ? { content: data.content } : {}),
            ...(data.status !== undefined ? { status: data.status } : {})
        };

        return await this.repository.update(id, payload);
    }

    async deleteSource(id: string) {
        if (!this.isValidUuid(id)) {
            throw new Error("El identificador de la source es inválido.");
        }

        return await this.repository.delete(id);
    }
}
