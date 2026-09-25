import { pool } from "../config/database.js";

export interface CreateStructuredDataInput {
    analysis_id: string;
    source_id: string;
    data: Record<string, unknown>;
}

export interface UpdateStructuredDataInput {
    source_id?: string;
    data?: Record<string, unknown>;
}

export class StructuredDataRepository {
    async create(data: CreateStructuredDataInput) {
        const query = `
            INSERT INTO structured_data (
                analysis_id,
                source_id,
                data
            )
            VALUES ($1, $2, $3)
            RETURNING *
        `;

        const result = await pool.query(query, [
            data.analysis_id,
            data.source_id,
            data.data
        ]);

        return result.rows[0];
    }

    async findByAnalysisId(analysisId: string) {
        const query = `
            SELECT *
            FROM structured_data
            WHERE analysis_id = $1
            ORDER BY created_at DESC
        `;

        const result = await pool.query(query, [analysisId]);
        return result.rows;
    }

    async findById(id: string) {
        const query = `
            SELECT *
            FROM structured_data
            WHERE id = $1
        `;

        const result = await pool.query(query, [id]);
        return result.rows[0] ?? null;
    }

    async update(id: string, data: UpdateStructuredDataInput) {
        const fields: string[] = [];
        const values: unknown[] = [];
        let index = 1;

        if (data.source_id !== undefined) {
            fields.push(`source_id = $${index}`);
            values.push(data.source_id);
            index += 1;
        }

        if (data.data !== undefined) {
            fields.push(`data = $${index}`);
            values.push(data.data);
            index += 1;
        }

        if (fields.length === 0) {
            return this.findById(id);
        }

        values.push(id);
        const query = `
            UPDATE structured_data
            SET ${fields.join(", ")}
            WHERE id = $${index}
            RETURNING *
        `;

        const result = await pool.query(query, values);
        return result.rows[0] ?? null;
    }

    async delete(id: string) {
        const query = `
            DELETE FROM structured_data
            WHERE id = $1
            RETURNING *
        `;

        const result = await pool.query(query, [id]);
        return result.rows[0] ?? null;
    }
}
