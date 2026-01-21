import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { generateToken, hashPassword } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state') && searchParams.get('state') !== '/' ? searchParams.get('state')! : '/chat';

    // Dynamic Host Detection
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'http';

    // Prefer env var if set (manual override), otherwise dynamic host, otherwise localhost fallback
    const rootUrl = process.env.NEXT_PUBLIC_APP_URL || (host ? `${protocol}://${host}` : 'http://localhost:3000');

    if (error || !code) {
        return NextResponse.redirect(new URL(`${rootUrl}/login?error=google_auth_failed`, request.url));
    }

    try {
        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                code,
                grant_type: 'authorization_code',
                redirect_uri: `${rootUrl}/api/auth/google/callback`,
            }),
        });

        const tokens = await tokenResponse.json();

        if (!tokens.access_token) {
            console.error("Token exchange failed:", tokens);
            throw new Error('Failed to retrieve access token');
        }

        // Get User Info
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });

        const googleUser = await userResponse.json();

        if (!googleUser.email) {
            throw new Error('No email found in Google profile');
        }

        // Check if user exists
        const existing = await sql`SELECT * FROM users WHERE email = ${googleUser.email}`;
        let user = existing.rows[0];

        if (!user) {
            // Create new user with random password
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = await hashPassword(randomPassword);
            const name = googleUser.name || googleUser.given_name || googleUser.email.split('@')[0];

            const newUser = await sql`
        INSERT INTO users (name, email, password)
        VALUES (${name}, ${googleUser.email}, ${hashedPassword})
        RETURNING *
      `;
            user = newUser.rows[0];
        }

        // Generate Session
        const payload = { id: user.id, email: user.email, name: user.name };
        const token = generateToken(payload);

        // Set Cookie with 30-day expiry
        const cookieStore = await cookies();
        cookieStore.set("nexis_session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 30 // 30 days
        });

        return NextResponse.redirect(new URL(`${rootUrl}${state}`, request.url));

    } catch (err) {
        console.error('Google Auth Error:', err);
        return NextResponse.redirect(new URL(`${rootUrl}/login?error=google_auth_error`, request.url));
    }
}
