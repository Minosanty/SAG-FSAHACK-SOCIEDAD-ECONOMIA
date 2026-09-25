import { pool } from "../config/database.js";

export interface CreateSourceData {
    analysis_id: string;
    name: string;
    type: string;
    location?: string;
    content?: Record<string, unknown> | null;
    status?: string;
}

export interface UpdateSourceData {
    name?: string;
    type?: string;
    location?: string;
    content?: Record<string, unknown> | null;
    status?: string;
}

export class SourceRepository {
    async create(data: CreateSourceData) {
        const query = `
            INSERT INTO sources (
                analysis_id,
                name,
                type,
                location,
                content,
                status
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const result = await pool.query(query, [
            data.analysis_id,
            data.name,
            data.type,
            data.location ?? null,
            data.content ?? null,
            data.status ?? "pending"
        ]);

        return result.rows[0];
    }

    async findByAnalysisId(analysisId: string) {
        const query = `
            SELECT *
            FROM sources
            WHERE analysis_id = $1
            ORDER BY created_at DESC
        `;

        const result = await pool.query(query, [analysisId]);
        return result.rows;
    }

    async findById(id: string) {
        const query = `
            SELECT *
            FROM sources
            WHERE id = $1
        `;

        const result = await pool.query(query, [id]);
        return result.rows[0] ?? null;
    }

    async update(id: string, data: UpdateSourceData) {
        const fields: string[] = [];
        const values: unknown[] = [];
        let index = 1;

        if (data.name !== undefined) {
            fields.push(`name = $${index}`);
            values.push(data.name);
            index += 1;
        }

        if (data.type !== undefined) {
            fields.push(`type = $${index}`);
            values.push(data.type);
            index += 1;
        }

        if (data.location !== undefined) {
            fields.push(`location = $${index}`);
            values.push(data.location ?? null);
            index += 1;
        }

        if (data.content !== undefined) {
            fields.push(`content = $${index}`);
            values.push(data.content ?? null);
            index += 1;
        }

        if (data.status !== undefined) {
            fields.push(`status = $${index}`);
            values.push(data.status);
            index += 1;
        }

        if (fields.length === 0) {
            return this.findById(id);
        }

        values.push(id);
        const query = `
            UPDATE sources
            SET ${fields.join(", ")}
            WHERE id = $${index}
            RETURNING *
        `;

        const result = await pool.query(query, values);
        return result.rows[0] ?? null;
    }

    async delete(id: string) {
        const query = `
            DELETE FROM sources
            WHERE id = $1
            RETURNING *
        `;

        const result = await pool.query(query, [id]);
        return result.rows[0] ?? null;
    }
}
