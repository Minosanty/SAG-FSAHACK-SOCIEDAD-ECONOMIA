import { pool } from "../config/database.js";

export interface CreateAnalysisData {
    name: string;
    description?: string;
}

export class AnalysisRepository {

    async findAll() {

        const query = `
            SELECT
                id,
                name,
                description,
                status,
                created_at,
                updated_at
            FROM analyses
            ORDER BY created_at DESC
        `;

        const result = await pool.query(query);

        return result.rows;
    }

    async create(data: CreateAnalysisData) {

        const query = `
            INSERT INTO analyses (
                name,
                description
            )
            VALUES ($1, $2)
            RETURNING
                id,
                name,
                description,
                status,
                created_at,
                updated_at
        `;

        const values = [
            data.name,
            data.description ?? null
        ];

        const result = await pool.query(query, values);

        return result.rows[0];
    }

    async findById(id: string) {

        const query = `
            SELECT
                id,
                name,
                description,
                status,
                created_at,
                updated_at
            FROM analyses
            WHERE id = $1
        `;

        const result = await pool.query(query, [id]);

        return result.rows[0];
    }

    async update(
        id: string,
        name: string,
        description?: string
    ) {

        const query = `
            UPDATE analyses
            SET
                name = $1,
                description = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING
                id,
                name,
                description,
                status,
                created_at,
                updated_at
        `;

        const values = [
            name,
            description ?? null,
            id
        ];

        const result = await pool.query(query, values);

        return result.rows[0];
    }

    async delete(id: string) {
        const query = `
            DELETE FROM analyses
            WHERE id = $1
            RETURNING
                id,
                name,
                description,
                status,
                created_at,
                updated_at
        `;

        const result = await pool.query(query, [id]);
        return result.rows[0] ?? null;
    }
}