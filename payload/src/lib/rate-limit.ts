const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 100;

export interface RateLimitResult {
  rateLimited: boolean;
  remaining: number;
  resetTime: number;
}

export async function checkRateLimit(
  identifier: string
): Promise<RateLimitResult> {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    return {
      rateLimited: false,
      remaining: MAX_REQUESTS - 1,
      resetTime: now + WINDOW_MS,
    };
  }

  if (record.count >= MAX_REQUESTS) {
    return {
      rateLimited: true,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count++;
  return {
    rateLimited: false,
    remaining: MAX_REQUESTS - record.count,
    resetTime: record.resetTime,
  };
}

setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, WINDOW_MS);
