import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { rows } = await sql`
            SELECT content, type, importance FROM memories_v2 
            WHERE user_id = ${user.id} 
            ORDER BY last_accessed DESC
        `;
        return NextResponse.json({ memories: rows });
    } catch (error) {
        console.error("Fetch Memories Error:", error);
        return NextResponse.json({ error: "Failed to fetch memories" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await sql`DELETE FROM memories_v2 WHERE user_id = ${user.id}`;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete Memories Error:", error);
        return NextResponse.json({ error: "Failed to clear memories" }, { status: 500 });
    }
}
