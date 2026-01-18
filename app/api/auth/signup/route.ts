import { NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
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
        const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (existingUser) {
            return NextResponse.json(
                { error: "Terminal ID already allocated (Email exists)" },
                { status: 409 }
            );
        }

        // Create User
        const hashedPassword = await hashPassword(password);
        const insert = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
        const result = insert.run(name, email, hashedPassword);

        // Generate Session
        const user = { id: result.lastInsertRowid, email, name };
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
