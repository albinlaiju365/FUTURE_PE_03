import { NextResponse } from "next/server";
import { getCurrentUser, generateToken } from "@/lib/auth";
import { sql } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET() {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
}

export async function POST(req: Request) {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { name } = await req.json();

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        // 1. Update DB
        const { rows } = await sql`
            UPDATE users 
            SET name = ${name} 
            WHERE id = ${user.id} 
            RETURNING id, name, email
        `;

        const updatedUser = rows[0];

        // 2. Refresh JWT with new name
        const payload = { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name };
        const token = generateToken(payload);

        // 3. Set New Cookie
        const cookieStore = await cookies();
        cookieStore.set("nexis_session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 30 // 30 days
        });

        return NextResponse.json({ user: updatedUser });
    } catch (error) {
        console.error("Profile Update Error:", error);
        return NextResponse.json({ error: "System failure during update" }, { status: 500 });
    }
}
