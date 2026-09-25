import { pool } from "../config/database.js";

export interface CreateAiFindingInput {
    analysis_id: string;
    description: string;
    type?: string | null;
    evidence?: Record<string, unknown> | null;
    source_ids?: string[] | null;
}

export class AiFindingRepository {
    async create(data: CreateAiFindingInput) {
        const query = `
            INSERT INTO ai_findings (
                analysis_id,
                description,
                type,
                evidence,
                source_ids
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;

        const result = await pool.query(query, [
            data.analysis_id,
            data.description,
            data.type ?? null,
            data.evidence ?? null,
            data.source_ids ?? null
        ]);

        return result.rows[0];
    }

    async findByAnalysisId(analysisId: string) {
        const query = `SELECT * FROM ai_findings WHERE analysis_id = $1 ORDER BY created_at DESC`;
        const result = await pool.query(query, [analysisId]);
        return result.rows;
    }

    async findById(id: string) {
        const query = `SELECT * FROM ai_findings WHERE id = $1`;
        const result = await pool.query(query, [id]);
        return result.rows[0] ?? null;
    }

    async update(id: string, data: Partial<CreateAiFindingInput>) {
        const fields: string[] = [];
        const values: unknown[] = [];
        let index = 1;

        if (data.description !== undefined) { fields.push(`description = $${index}`); values.push(data.description); index += 1; }
        if (data.type !== undefined) { fields.push(`type = $${index}`); values.push(data.type ?? null); index += 1; }
        if (data.evidence !== undefined) { fields.push(`evidence = $${index}`); values.push(data.evidence ?? null); index += 1; }
        if (data.source_ids !== undefined) { fields.push(`source_ids = $${index}`); values.push(data.source_ids ?? null); index += 1; }

        if (fields.length === 0) {
            return this.findById(id);
        }

        values.push(id);
        const query = `UPDATE ai_findings SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`;
        const result = await pool.query(query, values);
        return result.rows[0] ?? null;
    }

    async delete(id: string) {
        const query = `DELETE FROM ai_findings WHERE id = $1 RETURNING *`;
        const result = await pool.query(query, [id]);
        return result.rows[0] ?? null;
    }
}
