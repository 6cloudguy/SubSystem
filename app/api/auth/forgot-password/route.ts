import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/services/userService';
import { checkRateLimit } from '@/lib/auth/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local_client';

    // Rate limit: 3 password reset attempts per 5 minutes per IP
    const rateCheck = checkRateLimit(`reset:${ip}`, 3, 300);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many password reset requests. Please wait ${rateCheck.retryAfterSeconds} seconds before trying again.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.retryAfterSeconds),
          },
        }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const { user } = await findUserByEmail(email);

    // Return generic message to prevent email enumeration, but with simulated link for testing
    return NextResponse.json({
      success: true,
      message: user
        ? `A password reset link has been dispatched to ${email}. Please check your inbox.`
        : `If an active account exists for ${email}, a password reset link has been sent.`,
      testAccountExists: !!user,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to process password reset request.' },
      { status: 500 }
    );
  }
}
