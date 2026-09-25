import { pool } from "../config/database.js";

export interface CreateIndicatorInput {
    analysis_id: string;
    name: string;
    value?: number | null;
    unit?: string | null;
    calculation?: string | null;
    source_ids?: string[] | null;
}

export class IndicatorRepository {
    async create(data: CreateIndicatorInput) {
        const query = `
            INSERT INTO indicators (
                analysis_id,
                name,
                value,
                unit,
                calculation,
                source_ids
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const result = await pool.query(query, [
            data.analysis_id,
            data.name,
            data.value ?? null,
            data.unit ?? null,
            data.calculation ?? null,
            data.source_ids ?? null
        ]);

        return result.rows[0];
    }

    async findByAnalysisId(analysisId: string) {
        const query = `
            SELECT *
            FROM indicators
            WHERE analysis_id = $1
            ORDER BY created_at DESC
        `;

        const result = await pool.query(query, [analysisId]);
        return result.rows;
    }

    async findById(id: string) {
        const query = `SELECT * FROM indicators WHERE id = $1`;
        const result = await pool.query(query, [id]);
        return result.rows[0] ?? null;
    }

    async update(id: string, data: Partial<CreateIndicatorInput>) {
        const fields: string[] = [];
        const values: unknown[] = [];
        let index = 1;

        if (data.name !== undefined) {
            fields.push(`name = $${index}`); values.push(data.name); index += 1;
        }
        if (data.value !== undefined) {
            fields.push(`value = $${index}`); values.push(data.value ?? null); index += 1;
        }
        if (data.unit !== undefined) {
            fields.push(`unit = $${index}`); values.push(data.unit ?? null); index += 1;
        }
        if (data.calculation !== undefined) {
            fields.push(`calculation = $${index}`); values.push(data.calculation ?? null); index += 1;
        }
        if (data.source_ids !== undefined) {
            fields.push(`source_ids = $${index}`); values.push(data.source_ids ?? null); index += 1;
        }

        if (fields.length === 0) {
            return this.findById(id);
        }

        values.push(id);
        const query = `UPDATE indicators SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`;
        const result = await pool.query(query, values);
        return result.rows[0] ?? null;
    }

    async delete(id: string) {
        const query = `DELETE FROM indicators WHERE id = $1 RETURNING *`;
        const result = await pool.query(query, [id]);
        return result.rows[0] ?? null;
    }
}
