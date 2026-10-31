import { prisma } from '@/lib/prisma';
import {
  verifyPassword,
  hashPassword,
  validatePasswordPolicy,
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_STAFF_PASSWORD,
  DEFAULT_CUSTOMER_PASSWORD,
} from '@/lib/auth/password';
import { User, UserRole, UserStatus } from '@/lib/types';

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string | null;
  assignedCustomersCount?: number;
  lastActive?: string | null;
  createdAt?: string | Date;
}

function safeFormatDate(val: any): string | null {
  if (!val) return null;
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val.toISOString();
  }
  const dateObj = new Date(val);
  if (!isNaN(dateObj.getTime())) {
    return dateObj.toISOString();
  }
  return typeof val === 'string' ? val : null;
}

/**
 * Remove sensitive passwordHash from user object before sending to client
 */
export function toSafeUser(user: any): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
    status: user.status as UserStatus,
    avatarUrl: user.avatarUrl || null,
    assignedCustomersCount: user.assignedCustomersCount || 0,
    lastActive: safeFormatDate(user.lastActive),
    createdAt: safeFormatDate(user.createdAt) || new Date().toISOString(),
  };
}

/**
 * Determine default password for initial seed accounts
 */
function getDefaultPasswordForRole(role?: string): string {
  if (role === 'ADMIN') return DEFAULT_ADMIN_PASSWORD;
  if (role === 'CUSTOMER') return DEFAULT_CUSTOMER_PASSWORD;
  return DEFAULT_STAFF_PASSWORD;
}

/**
 * Find user by email in PostgreSQL
 */
export async function findUserByEmail(email: string) {
  const normalized = email.toLowerCase().trim();

  try {
    const dbUser = await prisma.user.findUnique({
      where: { email: normalized },
    });
    if (dbUser) return { user: dbUser, fromDb: true };
  } catch (error) {
    console.error('[userService] Database query error finding user:', error);
  }

  return { user: null, fromDb: false };
}

/**
 * Authenticate user credentials with bcrypt password verification
 * If the user's passwordHash in PostgreSQL is empty/unhashed, automatically hashes and saves it!
 */
export async function authenticateUser(email: string, passwordPlain: string) {
  const normalized = email.toLowerCase().trim();
  const { user, fromDb } = await findUserByEmail(normalized);

  if (!user) {
    return { success: false, error: 'Invalid email or password.' };
  }

  if (user.status !== 'ACTIVE') {
    return { success: false, error: 'This account has been deactivated. Please contact your administrator.' };
  }

  let isMatch = false;

  // Case 1: Has a stored bcrypt password hash
  if (user.passwordHash && user.passwordHash.startsWith('$2')) {
    isMatch = await verifyPassword(passwordPlain, user.passwordHash);
  } else {
    // Case 2: Database has blank or unmigrated hash - check if matches expected default password
    const defaultExpected = getDefaultPasswordForRole(user.role);
    if (defaultExpected && passwordPlain === defaultExpected) {
      isMatch = true;
    }
  }

  if (!isMatch) {
    return { success: false, error: 'Invalid email or password.' };
  }

  // If user is from PostgreSQL and needs their password hash saved / updated:
  if (fromDb && (!user.passwordHash || !user.passwordHash.startsWith('$2'))) {
    try {
      const newHash = await hashPassword(passwordPlain);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newHash,
          lastActive: new Date(),
        },
      });
      console.log(`[userService] Updated password hash in database for user ${user.email}`);
    } catch (e) {
      console.error('[userService] Failed to update password hash in DB:', e);
    }
  } else if (fromDb) {
    // Update lastActive timestamp
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastActive: new Date() },
      });
    } catch (e) {
      // Non-critical
    }
  }

  return {
    success: true,
    user: toSafeUser(user),
  };
}

/**
 * Create a new user with hashed password in database
 */
export async function createStaffUser(data: {
  name: string;
  email: string;
  passwordPlain: string;
  role: UserRole;
}) {
  const policyCheck = validatePasswordPolicy(data.passwordPlain);
  if (!policyCheck.isValid) {
    return {
      success: false,
      error: policyCheck.errors.join(' '),
      validationErrors: policyCheck.errors,
    };
  }

  const normalized = data.email.toLowerCase().trim();
  const existing = await findUserByEmail(normalized);
  if (existing.user) {
    return { success: false, error: 'A user with this email address already exists.' };
  }

  const hashedPassword = await hashPassword(data.passwordPlain);

  try {
    const created = await prisma.user.create({
      data: {
        name: data.name,
        email: normalized,
        passwordHash: hashedPassword,
        role: data.role,
        status: 'ACTIVE',
        lastActive: new Date(),
      },
    });

    return { success: true, user: toSafeUser(created) };
  } catch (err: any) {
    console.error('[userService] Failed to create user in DB:', err);
    return { success: false, error: err.message || 'Database error creating user.' };
  }
}

/**
 * Reset / update user password with policy validation and bcrypt hashing
 */
export async function updateUserPassword(email: string, newPasswordPlain: string) {
  const policyCheck = validatePasswordPolicy(newPasswordPlain);
  if (!policyCheck.isValid) {
    return {
      success: false,
      error: policyCheck.errors.join(' '),
      validationErrors: policyCheck.errors,
    };
  }

  const normalized = email.toLowerCase().trim();
  const { user } = await findUserByEmail(normalized);

  if (!user) {
    return { success: false, error: 'No account found with this email address.' };
  }

  const newHash = await hashPassword(newPasswordPlain);

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
        updatedAt: new Date(),
      },
    });
    return { success: true, message: 'Password has been securely updated in the database.' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Database error updating password.' };
  }
}
