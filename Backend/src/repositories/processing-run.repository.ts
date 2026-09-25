import { pool } from "../config/database.js";

export interface CreateProcessingRunInput {
    analysis_id: string;
    stage: string;
    status?: string;
    error_message?: string | null;
    started_at?: Date | string | null;
    finished_at?: Date | string | null;
}

export class ProcessingRunRepository {
    async create(data: CreateProcessingRunInput) {
        const query = `
            INSERT INTO processing_runs (
                analysis_id,
                stage,
                status,
                error_message,
                started_at,
                finished_at
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const result = await pool.query(query, [
            data.analysis_id,
            data.stage,
            data.status ?? "pending",
            data.error_message ?? null,
            data.started_at ?? null,
            data.finished_at ?? null
        ]);

        return result.rows[0];
    }

    async findByAnalysisId(analysisId: string) {
        const query = `SELECT * FROM processing_runs WHERE analysis_id = $1 ORDER BY started_at DESC NULLS LAST`;
        const result = await pool.query(query, [analysisId]);
        return result.rows;
    }

    async findById(id: string) {
        const query = `SELECT * FROM processing_runs WHERE id = $1`;
        const result = await pool.query(query, [id]);
        return result.rows[0] ?? null;
    }

    async update(id: string, data: Partial<CreateProcessingRunInput>) {
        const fields: string[] = [];
        const values: unknown[] = [];
        let index = 1;

        if (data.stage !== undefined) { fields.push(`stage = $${index}`); values.push(data.stage); index += 1; }
        if (data.status !== undefined) { fields.push(`status = $${index}`); values.push(data.status); index += 1; }
        if (data.error_message !== undefined) { fields.push(`error_message = $${index}`); values.push(data.error_message ?? null); index += 1; }
        if (data.started_at !== undefined) { fields.push(`started_at = $${index}`); values.push(data.started_at ?? null); index += 1; }
        if (data.finished_at !== undefined) { fields.push(`finished_at = $${index}`); values.push(data.finished_at ?? null); index += 1; }

        if (fields.length === 0) {
            return this.findById(id);
        }

        values.push(id);
        const query = `UPDATE processing_runs SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`;
        const result = await pool.query(query, values);
        return result.rows[0] ?? null;
    }

    async delete(id: string) {
        const query = `DELETE FROM processing_runs WHERE id = $1 RETURNING *`;
        const result = await pool.query(query, [id]);
        return result.rows[0] ?? null;
    }
}
