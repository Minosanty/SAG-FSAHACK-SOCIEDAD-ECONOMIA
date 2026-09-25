import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Client } = pg;

const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "postgres"
});

async function createDatabase() {
    try {
        await client.connect();

        const databaseName = process.env.DB_NAME;

        const result = await client.query(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            [databaseName]
        );

        if (result.rowCount === 0) {
            await client.query(`CREATE DATABASE "${databaseName}"`);
            console.log(`Base de datos "${databaseName}" creada correctamente.`);
        } else {
            console.log(`La base de datos "${databaseName}" ya existe.`);
        }

    } catch (error) {
        console.error("Error creando la base de datos:", error);
    } finally {
        await client.end();
    }
}

createDatabase();