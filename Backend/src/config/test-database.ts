import { pool } from "./database.js";

async function testDatabase() {
    try {
        const result = await pool.query("SELECT NOW()");

        console.log("Conexión a PostgreSQL exitosa.");
        console.log("Hora del servidor:", result.rows[0].now);

    } catch (error) {
        console.error("Error conectando a PostgreSQL:", error);

    } finally {
        await pool.end();
    }
}

testDatabase();