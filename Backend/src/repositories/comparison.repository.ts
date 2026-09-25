import { pool } from "../config/database.js";

export interface CreateComparisonInput {
    analysis_id: string;
    variable: string;
    source_a: Record<string, unknown>;
    source_b: Record<string, unknown>;
    difference?: number | null;
    percentage_difference?: number | null;
}

export class ComparisonRepository {
    async create(data: CreateComparisonInput) {
        const query = `
            INSERT INTO comparisons (
                analysis_id,
                variable,
                source_a,
                source_b,
                difference,
                percentage_difference
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const result = await pool.query(query, [
            data.analysis_id,
            data.variable,
            data.source_a,
            data.source_b,
            data.difference ?? null,
            data.percentage_difference ?? null
        ]);

        return result.rows[0];
    }

    async findByAnalysisId(analysisId: string) {
        const query = `SELECT * FROM comparisons WHERE analysis_id = $1 ORDER BY created_at DESC`;
        const result = await pool.query(query, [analysisId]);
        return result.rows;
    }

    async findById(id: string) {
        const query = `SELECT * FROM comparisons WHERE id = $1`;
        const result = await pool.query(query, [id]);
        return result.rows[0] ?? null;
    }

    async update(id: string, data: Partial<CreateComparisonInput>) {
        const fields: string[] = [];
        const values: unknown[] = [];
        let index = 1;

        if (data.variable !== undefined) { fields.push(`variable = $${index}`); values.push(data.variable); index += 1; }
        if (data.source_a !== undefined) { fields.push(`source_a = $${index}`); values.push(data.source_a); index += 1; }
        if (data.source_b !== undefined) { fields.push(`source_b = $${index}`); values.push(data.source_b); index += 1; }
        if (data.difference !== undefined) { fields.push(`difference = $${index}`); values.push(data.difference ?? null); index += 1; }
        if (data.percentage_difference !== undefined) { fields.push(`percentage_difference = $${index}`); values.push(data.percentage_difference ?? null); index += 1; }

        if (fields.length === 0) {
            return this.findById(id);
        }

        values.push(id);
        const query = `UPDATE comparisons SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`;
        const result = await pool.query(query, values);
        return result.rows[0] ?? null;
    }

    async delete(id: string) {
        const query = `DELETE FROM comparisons WHERE id = $1 RETURNING *`;
        const result = await pool.query(query, [id]);
        return result.rows[0] ?? null;
    }
}
