import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const redirectUrl = searchParams.get('redirect_url') || '/chat';

    // Dynamic Host Detection
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'http';

    // Prefer env var if set (manual override), otherwise dynamic host, otherwise localhost fallback
    const rootUrl = process.env.NEXT_PUBLIC_APP_URL || (host ? `${protocol}://${host}` : 'http://localhost:3000');

    if (!process.env.GOOGLE_CLIENT_ID) {
        return NextResponse.json({ error: "Google Client ID not configured" }, { status: 500 });
    }

    const params = {
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: `${rootUrl}/api/auth/google/callback`,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        state: redirectUrl,
        prompt: 'consent',
    };

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams(params).toString()}`;

    return NextResponse.redirect(url);
}
