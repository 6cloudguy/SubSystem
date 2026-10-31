// Rate limiting helper per Section 7 (Security and reliability):
// "Rate-limit login and password-reset attempts"

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const tracker = new Map<string, RateLimitRecord>();

// Clean up expired entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of tracker.entries()) {
      if (record.resetAt <= now) {
        tracker.delete(key);
      }
    }
  }, 60 * 1000);
}

export function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowSeconds: number = 60
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const record = tracker.get(identifier);

  if (!record || record.resetAt <= now) {
    tracker.set(identifier, {
      count: 1,
      resetAt: now + windowSeconds * 1000,
    });
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      retryAfterSeconds: 0,
    };
  }

  if (record.count >= maxAttempts) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(retryAfter, 1),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxAttempts - record.count,
    retryAfterSeconds: 0,
  };
}

export function resetRateLimit(identifier: string): void {
  tracker.delete(identifier);
}

