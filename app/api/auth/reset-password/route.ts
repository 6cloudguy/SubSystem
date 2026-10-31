import { NextRequest, NextResponse } from 'next/server';
import { updateUserPassword } from '@/lib/services/userService';
import { validatePasswordPolicy } from '@/lib/auth/password';

export async function POST(request: NextRequest) {
  try {
    const { email, newPassword, confirmPassword } = await request.json();

    if (!email || !newPassword) {
      return NextResponse.json({ error: 'Email and new password are required.' }, { status: 400 });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 });
    }

    const validation = validatePasswordPolicy(newPassword);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: validation.errors[0] || 'Password does not meet the security policy requirements.',
          requirements: validation.requirements,
        },
        { status: 400 }
      );
    }

    const result = await updateUserPassword(email, newPassword);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully updated with secure bcrypt hashing.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to reset password.' },
      { status: 500 }
    );
  }
}
