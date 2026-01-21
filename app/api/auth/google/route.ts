import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const redirectUrl = searchParams.get('redirect_url') || '/chat';

    const rootUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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
