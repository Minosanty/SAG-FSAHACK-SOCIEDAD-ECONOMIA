import fs from "fs";
import path from "path";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Client } = pg;

const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

async function migrate() {
    try {
        await client.connect();

        console.log("Conectado a PostgreSQL.");

        const migrationsPath = path.join(
            process.cwd(),
            "database",
            "migrations"
        );

        const files = fs
            .readdirSync(migrationsPath)
            .filter(file => file.endsWith(".sql"))
            .sort();

        for (const file of files) {
            console.log(`Ejecutando ${file}...`);

            const filePath = path.join(migrationsPath, file);

            const sql = fs.readFileSync(filePath, "utf8");

            await client.query(sql);

            console.log(`${file} ejecutado correctamente.`);
        }

        console.log("Todas las migraciones fueron ejecutadas.");

    } catch (error) {
        console.error("Error ejecutando migraciones:", error);

    } finally {
        await client.end();
    }
}

migrate();