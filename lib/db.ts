import Database from 'better-sqlite3';
import path from 'path';

// Initialize the database
const dbPath = path.join(process.cwd(), 'nexis.db');
const db = new Database(dbPath);

// Create the users table if it doesn't exist
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`;

db.exec(createTableQuery);

export default db;
