import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/services/userService';
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_EXPIRY_SECONDS } from '@/lib/auth/session';
import { checkRateLimit, resetRateLimit } from '@/lib/auth/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local_client';
    
    // Rate limit: 5 login attempts per minute per IP
    const rateCheck = checkRateLimit(`login:${ip}`, 5, 60);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many login attempts. Please wait ${rateCheck.retryAfterSeconds} seconds before trying again.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.retryAfterSeconds),
          },
        }
      );
    }

    const body = await request.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const authResult = await authenticateUser(email, password);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Invalid credentials.' },
        { status: 401 }
      );
    }

    // Reset rate limit upon successful login
    resetRateLimit(`login:${ip}`);

    const user = authResult.user;
    const sessionToken = createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user,
      message: 'Login successful.',
    });

    // Set secure HttpOnly session cookie per Section 7 of INSTRUCTIONS.txt
    const maxAge = rememberMe ? SESSION_EXPIRY_SECONDS : 60 * 60 * 24; // 7 days vs 1 day

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    return response;
  } catch (error: any) {
    console.error('Login route error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during login. Please try again.' },
      { status: 500 }
    );
  }
}
