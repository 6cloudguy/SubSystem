import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasSpecialChar: boolean;
  };
}

/**
 * Validates password according to Brightloop Subscription System policy:
 * - More than 8 characters (> 8, i.e., min 9 chars)
 * - Includes uppercase letter
 * - Includes lowercase letter
 * - Includes a special character
 */
export function validatePasswordPolicy(password: string): PasswordValidationResult {
  const minLength = (password || '').length > 8;
  const hasUppercase = /[A-Z]/.test(password || '');
  const hasLowercase = /[a-z]/.test(password || '');
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>~`_\-+=\[\]\\\/]/.test(password || '');

  const errors: string[] = [];
  if (!minLength) {
    errors.push('Password must be more than 8 characters in length.');
  }
  if (!hasUppercase) {
    errors.push('Password must include at least one uppercase letter (A-Z).');
  }
  if (!hasLowercase) {
    errors.push('Password must include at least one lowercase letter (a-z).');
  }
  if (!hasSpecialChar) {
    errors.push('Password must include at least one special character (e.g. !@#$%^&*).');
  }

  return {
    isValid: minLength && hasUppercase && hasLowercase && hasSpecialChar,
    errors,
    requirements: {
      minLength,
      hasUppercase,
      hasLowercase,
      hasSpecialChar,
    },
  };
}

/**
 * Hash a password using bcrypt with salt rounds = 10
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Synchronous hash helper for seeding and tests
 */
export function hashPasswordSync(password: string): string {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

/**
 * Verify a plain text password against a stored bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Synchronous verify helper
 */
export function verifyPasswordSync(password: string, hash: string): boolean {
  if (!password || !hash) return false;
  try {
    return bcrypt.compareSync(password, hash);
  } catch {
    return false;
  }
}

// Default initial passwords for seed accounts
export const DEFAULT_ADMIN_PASSWORD = 'Admin@BrightLoop2026!';
export const DEFAULT_STAFF_PASSWORD = 'Staff@BrightLoop2026!';
export const DEFAULT_CUSTOMER_PASSWORD = 'Customer@BrightLoop2026!';
