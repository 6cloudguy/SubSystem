import { NextRequest, NextResponse } from 'next/server';
import { verifySessionTokenEdge } from '@/lib/auth/edgeSession';

const SESSION_COOKIE_NAME = 'brightloop_session';

// Protected dashboard and administrative paths
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/customers',
  '/products',
  '/plans',
  '/quotations',
  '/subscriptions',
  '/invoices',
  '/payments',
  '/pricing',
  '/staff',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
    const session = sessionCookie ? await verifySessionTokenEdge(sessionCookie.value) : null;

    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based route protection: only ADMIN can access staff administration
    if (pathname.startsWith('/staff') && session.role !== 'ADMIN') {
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }



  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/customers/:path*',
    '/products/:path*',
    '/plans/:path*',
    '/quotations/:path*',
    '/subscriptions/:path*',
    '/invoices/:path*',
    '/payments/:path*',
    '/pricing/:path*',
    '/staff/:path*',
    '/login',
  ],
};
