// Edge-compatible session verification using Web Crypto API

const DEFAULT_SECRET = 'brightloop_hackathon_super_secret_session_key_2026';

export interface EdgeSessionPayload {
  userId: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'INTERNAL_STAFF' | 'CUSTOMER';
  exp: number;
}

function base64UrlToUint8Array(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function verifySessionTokenEdge(
  token: string,
  secret: string = process.env.SESSION_SECRET || DEFAULT_SECRET
): Promise<EdgeSessionPayload | null> {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadBase64, signatureBase64] = parts;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBytes = base64UrlToUint8Array(signatureBase64);
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as any,
      encoder.encode(payloadBase64)
    );

    if (!isValid) return null;

    const payloadJson = new TextDecoder().decode(base64UrlToUint8Array(payloadBase64));
    const payload: EdgeSessionPayload = JSON.parse(payloadJson);

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

