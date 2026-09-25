import { AnalysisRepository } from "../repositories/analysis.repository.js";

export class AnalysisService {

    private repository: AnalysisRepository;

    constructor() {
        this.repository = new AnalysisRepository();
    }

    async getAllAnalyses() {

        return await this.repository.findAll();
    }

    async createAnalysis(
        name: string,
        description?: string
    ) {

        if (!name || name.trim() === "") {
            throw new Error("El nombre del análisis es obligatorio.");
        }

        return await this.repository.create({
            name: name.trim(),
            ...(description !== undefined ? { description } : {})
        });
    }

    async getAnalysis(id: string) {

        return await this.repository.findById(id);
    }

    async updateAnalysis(
        id: string,
        name: string,
        description?: string
    ) {

        if (!name || name.trim() === "") {
            throw new Error("El nombre del análisis es obligatorio.");
        }

        return await this.repository.update(
            id,
            name.trim(),
            description
        );
    }

    async deleteAnalysis(id: string) {
        return await this.repository.delete(id);
    }
}