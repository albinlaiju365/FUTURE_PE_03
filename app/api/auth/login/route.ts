import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { verifyPassword, generateToken } from "@/lib/auth";
import { cookies } from "next/headers";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = loginSchema.parse(body);

        // Fetch User
        const { rows } = await sql`SELECT * FROM users WHERE email = ${email}`;
        const user = rows[0];

        if (!user || !(await verifyPassword(password, user.password))) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Generate Session
        const payload = { id: user.id, email: user.email, name: user.name };
        const token = generateToken(payload);

        // Set Cookie
        const cookieStore = await cookies();
        cookieStore.set("nexis_session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        return NextResponse.json({ success: true, user: payload });
    } catch (error) {
        return NextResponse.json({ error: "Authentication Failed" }, { status: 500 });
    }
}
