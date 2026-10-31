import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'brightloop_session';
const SESSION_EXPIRY_SECONDS = 60 * 60 * 24 * 7; // 7 days
const DEFAULT_SECRET = 'brightloop_hackathon_super_secret_session_key_2026';

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'INTERNAL_STAFF' | 'CUSTOMER';
  exp: number; // UNIX timestamp in seconds
}

function getSecretKey(): string {
  return process.env.SESSION_SECRET || DEFAULT_SECRET;
}

/**
 * Creates an HMAC-SHA256 signed session token.
 */
export function createSessionToken(user: {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'INTERNAL_STAFF' | 'CUSTOMER';
}): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_EXPIRY_SECONDS;
  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp,
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSecretKey())
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

/**
 * Verifies the token signature and expiration.
 */
export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadBase64, signature] = parts;

  const expectedSignature = crypto
    .createHmac('sha256', getSecretKey())
    .update(payloadBase64)
    .digest('base64url');

  // Constant-time comparison to prevent timing attacks
  if (
    signature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  ) {
    return null;
  }

  try {
    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf8');
    const payload: SessionPayload = JSON.parse(payloadJson);

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export { SESSION_COOKIE_NAME, SESSION_EXPIRY_SECONDS };
