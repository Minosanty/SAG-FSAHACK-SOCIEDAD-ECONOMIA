import { pool } from "../config/database.js";

export interface CreateQualityResultInput {
    analysis_id: string;
    inconsistencies?: unknown[] | null;
    missing_data?: unknown[] | null;
    duplicates?: unknown[] | null;
    format_errors?: unknown[] | null;
    outdated_sources?: unknown[] | null;
}

export class QualityResultRepository {
    async create(data: CreateQualityResultInput) {
        const query = `
            INSERT INTO quality_results (
                analysis_id,
                inconsistencies,
                missing_data,
                duplicates,
                format_errors,
                outdated_sources
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const result = await pool.query(query, [
            data.analysis_id,
            data.inconsistencies ?? [],
            data.missing_data ?? [],
            data.duplicates ?? [],
            data.format_errors ?? [],
            data.outdated_sources ?? []
        ]);

        return result.rows[0];
    }

    async findByAnalysisId(analysisId: string) {
        const query = `SELECT * FROM quality_results WHERE analysis_id = $1 ORDER BY created_at DESC`;
        const result = await pool.query(query, [analysisId]);
        return result.rows;
    }

    async findById(id: string) {
        const query = `SELECT * FROM quality_results WHERE id = $1`;
        const result = await pool.query(query, [id]);
        return result.rows[0] ?? null;
    }

    async update(id: string, data: Partial<CreateQualityResultInput>) {
        const fields: string[] = [];
        const values: unknown[] = [];
        let index = 1;

        if (data.inconsistencies !== undefined) { fields.push(`inconsistencies = $${index}`); values.push(data.inconsistencies ?? []); index += 1; }
        if (data.missing_data !== undefined) { fields.push(`missing_data = $${index}`); values.push(data.missing_data ?? []); index += 1; }
        if (data.duplicates !== undefined) { fields.push(`duplicates = $${index}`); values.push(data.duplicates ?? []); index += 1; }
        if (data.format_errors !== undefined) { fields.push(`format_errors = $${index}`); values.push(data.format_errors ?? []); index += 1; }
        if (data.outdated_sources !== undefined) { fields.push(`outdated_sources = $${index}`); values.push(data.outdated_sources ?? []); index += 1; }

        if (fields.length === 0) {
            return this.findById(id);
        }

        values.push(id);
        const query = `UPDATE quality_results SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`;
        const result = await pool.query(query, values);
        return result.rows[0] ?? null;
    }

    async delete(id: string) {
        const query = `DELETE FROM quality_results WHERE id = $1 RETURNING *`;
        const result = await pool.query(query, [id]);
        return result.rows[0] ?? null;
    }
}
