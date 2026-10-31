import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/services/userService';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const { user } = await findUserByEmail(email);

    // Standard secure response preventing email enumeration
    return NextResponse.json({
      success: true,
      message: user
        ? `A password reset link has been dispatched to ${email}. Please check your inbox.`
        : `If an active account exists for ${email}, a password reset link has been sent.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to process password reset request.' },
      { status: 500 }
    );
  }
}
