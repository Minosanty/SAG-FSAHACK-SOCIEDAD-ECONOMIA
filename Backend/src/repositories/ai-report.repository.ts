import { pool } from "../config/database.js";

export interface CreateAiReportInput {
    analysis_id: string;
    summary?: string | null;
    findings?: unknown[] | null;
    possible_needs?: unknown[] | null;
    additional_information?: unknown[] | null;
    questions?: unknown[] | null;
}

export class AiReportRepository {
    async create(data: CreateAiReportInput) {
        const query = `
            INSERT INTO ai_reports (
                analysis_id,
                summary,
                findings,
                possible_needs,
                additional_information,
                questions
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const result = await pool.query(query, [
            data.analysis_id,
            data.summary ?? null,
            data.findings ?? [],
            data.possible_needs ?? [],
            data.additional_information ?? [],
            data.questions ?? []
        ]);

        return result.rows[0];
    }

    async findByAnalysisId(analysisId: string) {
        const query = `SELECT * FROM ai_reports WHERE analysis_id = $1 ORDER BY created_at DESC`;
        const result = await pool.query(query, [analysisId]);
        return result.rows;
    }

    async findById(id: string) {
        const query = `SELECT * FROM ai_reports WHERE id = $1`;
        const result = await pool.query(query, [id]);
        return result.rows[0] ?? null;
    }

    async update(id: string, data: Partial<CreateAiReportInput>) {
        const fields: string[] = [];
        const values: unknown[] = [];
        let index = 1;

        if (data.summary !== undefined) { fields.push(`summary = $${index}`); values.push(data.summary ?? null); index += 1; }
        if (data.findings !== undefined) { fields.push(`findings = $${index}`); values.push(data.findings ?? []); index += 1; }
        if (data.possible_needs !== undefined) { fields.push(`possible_needs = $${index}`); values.push(data.possible_needs ?? []); index += 1; }
        if (data.additional_information !== undefined) { fields.push(`additional_information = $${index}`); values.push(data.additional_information ?? []); index += 1; }
        if (data.questions !== undefined) { fields.push(`questions = $${index}`); values.push(data.questions ?? []); index += 1; }

        if (fields.length === 0) {
            return this.findById(id);
        }

        values.push(id);
        const query = `UPDATE ai_reports SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`;
        const result = await pool.query(query, values);
        return result.rows[0] ?? null;
    }

    async delete(id: string) {
        const query = `DELETE FROM ai_reports WHERE id = $1 RETURNING *`;
        const result = await pool.query(query, [id]);
        return result.rows[0] ?? null;
    }
}
