import { sql } from '@vercel/postgres';

// Initialize tables if they don't exist
// Note: In Postgres, we usually do this via migrations, but for this "self-repairing" system,
// we will run a check on the first connection (or let the user call an init route).
// For now, these are just helper strings for manual initialization if needed.

export const createUsersTableParams = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
`;

export const createMemoriesTableParams = `
    CREATE TABLE IF NOT EXISTS memories_v2 (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        type TEXT NOT NULL,
        confidence REAL DEFAULT 1.0,
        importance TEXT DEFAULT 'medium',
        last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        decay_rate TEXT DEFAULT 'slow',
        metadata JSONB
    );
`;

export const createChatsTableParams = `
    CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title TEXT,
        messages JSONB,
        type TEXT DEFAULT 'standard',
        mode TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
`;

export { sql };
