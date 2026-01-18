import Database from 'better-sqlite3';
import path from 'path';

// Initialize the database
// Initialize the database
// Vercel Serverless Hack: Use /tmp for write access in production
// Note: This data is ephemeral and will be wiped on cold starts.
const dbPath = process.env.NODE_ENV === 'production'
    ? '/tmp/nexis.db'
    : path.join(process.cwd(), 'nexis.db');

const db = new Database(dbPath);

// Create the users table if it doesn't exist
const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`;

// Create the v2 memories table (Lifecycle-based)
const createMemoriesTable = `
    CREATE TABLE IF NOT EXISTS memories_v2 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        type TEXT NOT NULL, -- identity, project, behavioral, ephemeral
        confidence REAL DEFAULT 1.0,
        importance TEXT DEFAULT 'medium', -- high, medium, low
        last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
        decay_rate TEXT DEFAULT 'slow', -- slow, fast, none
        metadata TEXT, -- JSON string for tags, provenance
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
`;

db.exec(createUsersTable);
db.exec(createMemoriesTable);

export default db;
