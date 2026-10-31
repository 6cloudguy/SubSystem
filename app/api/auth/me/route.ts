import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { findUserByEmail, toSafeUser } from '@/lib/services/userService';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const payload = verifySessionToken(sessionCookie.value);
    if (!payload) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const { user } = await findUserByEmail(payload.email);
    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      user: toSafeUser(user),
    });
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
