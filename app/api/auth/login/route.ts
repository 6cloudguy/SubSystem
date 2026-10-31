import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/services/userService';
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_EXPIRY_SECONDS } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
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
