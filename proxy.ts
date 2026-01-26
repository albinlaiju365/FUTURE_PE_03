import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    const token = request.cookies.get('nexis_session')?.value
    const { pathname } = request.nextUrl

    // 1. Redirect authenticated users away from public paths
    // If user has a token and tries to go to /, /login, or /signup -> send to /chat
    if (token) {
        if (pathname === '/' || pathname === '/login' || pathname === '/signup') {
            return NextResponse.redirect(new URL('/chat', request.url))
        }
    }

    // 2. Protect private routes
    // If user has NO token and tries to go to /chat -> send to /login
    if (!token) {
        if (pathname.startsWith('/chat')) {
            return NextResponse.redirect(new URL('/', request.url)) // Redirect to landing instead of login for smoother entry
        }
    }

    return NextResponse.next()
}

// Configure which paths the proxy runs on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - manifest.json (PWA manifest)
         * - icons (PWA icons)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons).*)',
    ],
}
