import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { hashPassword, generateToken } from "@/lib/auth";
import { cookies } from "next/headers";

const signupSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password } = signupSchema.parse(body);

        // Check format
        // Note: Using await sql`...` returns a Result object with .rows
        const { rows: existingUsers } = await sql`SELECT * FROM users WHERE email = ${email}`;

        if (existingUsers.length > 0) {
            return NextResponse.json(
                { error: "Terminal ID already allocated (Email exists)" },
                { status: 409 }
            );
        }

        // Create User
        const hashedPassword = await hashPassword(password);

        // Postgres: Use RETURNING id to get the ID back
        const { rows: newUsers } = await sql`
            INSERT INTO users (name, email, password) 
            VALUES (${name}, ${email}, ${hashedPassword})
            RETURNING id
        `;

        const userId = newUsers[0].id;

        // Generate Session
        const user = { id: userId, email, name };
        const token = generateToken(user);

        // Set Cookie
        const cookieStore = await cookies();
        cookieStore.set("nexis_session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        return NextResponse.json({ success: true, user });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
        }
        console.error("Signup error:", error);
        return NextResponse.json({ error: "System Uplink Failed" }, { status: 500 });
    }
}
