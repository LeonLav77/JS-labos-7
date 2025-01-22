import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    });

    try {
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                _id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                salt VARCHAR(255) NOT NULL
            );
        `;
        await connection.query(createUsersTable);

        const createPostsTable = `
            CREATE TABLE posts (
            _id INT AUTO_INCREMENT PRIMARY KEY,
            userId INT NOT NULL,
            timestamp DATETIME NOT NULL,
            comment TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(_id)
        );
        `;
        await connection.query(createPostsTable);

    } catch (error) {
        console.error('Migration failed:', error.message);
    } finally {
        await connection.end();
    }
}

// Run the migration script
migrate().catch((err) => console.error('Unexpected error:', err));
