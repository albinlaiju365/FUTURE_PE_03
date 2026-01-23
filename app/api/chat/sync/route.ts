import { NextResponse } from 'next/server';
import { sql, createChatsTableParams } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// Helper to ensure table exists
async function ensureTable() {
    try {
        await sql`SELECT count(*) FROM chats LIMIT 1`;
    } catch (e: any) {
        if (e.message.includes('relation "chats" does not exist')) {
            console.log("Creating chats table...");
            await sql.query(createChatsTableParams);
        }
    }
}

export async function GET() {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await ensureTable();
        const { rows } = await sql`
            SELECT * FROM chats 
            WHERE user_id = ${user.id} 
            ORDER BY updated_at DESC
        `;
        return NextResponse.json({ chats: rows });
    } catch (error) {
        console.error("Fetch Chats Error:", error);
        return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await ensureTable();
        const body = await req.json();
        const chats = Array.isArray(body) ? body : [body];

        // Process each chat upsert
        for (const chat of chats) {
            await sql`
                INSERT INTO chats (id, user_id, title, messages, type, mode, updated_at)
                VALUES (
                    ${chat.id}, 
                    ${user.id}, 
                    ${chat.title}, 
                    ${JSON.stringify(chat.messages)}::jsonb, 
                    ${chat.type || 'standard'}, 
                    ${chat.mode || null}, 
                    NOW()
                )
                ON CONFLICT (id) 
                DO UPDATE SET 
                    title = EXCLUDED.title,
                    messages = EXCLUDED.messages,
                    updated_at = NOW();
            `;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Sync Chats Error:", error);
        return NextResponse.json({ error: "Failed to sync chats" }, { status: 500 });
    }
}
export async function DELETE(req: Request) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const chatId = searchParams.get('id');

        if (!chatId) {
            return NextResponse.json({ error: "Chat ID required" }, { status: 400 });
        }

        await ensureTable();
        await sql`
            DELETE FROM chats 
            WHERE id = ${chatId} AND user_id = ${user.id}
        `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete Chat Error:", error);
        return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 });
    }
}
