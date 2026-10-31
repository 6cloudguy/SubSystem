import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, validatePasswordPolicy } from '@/lib/auth/password';
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_EXPIRY_SECONDS } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are all required.' },
        { status: 400 }
      );
    }

    // Password policy validation per Section 2.1
    const policy = validatePasswordPolicy(password);
    if (!policy.isValid) {
      return NextResponse.json(
        {
          error: policy.errors[0] || 'Password does not meet the complexity requirements.',
          requirements: policy.requirements,
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Create user in PostgreSQL
    const newUser = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        passwordHash,
        role: 'CUSTOMER',
        status: 'ACTIVE',
      },
    });

    // Also auto-create a linked Customer record if one does not exist
    try {
      await prisma.customer.create({
        data: {
          name: cleanName,
          email: cleanEmail,
          status: 'ACTIVE',
        },
      });
    } catch {
      // Customer record might already exist or optional
    }

    // Create session token
    const token = createSessionToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role as any,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_EXPIRY_SECONDS,
    });

    return response;
  } catch (error: any) {
    console.error('[register] Error creating account:', error);
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}

