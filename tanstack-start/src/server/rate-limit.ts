interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 100;

const LOGIN_WINDOW_MS = 5 * 60 * 1000;
const LOGIN_MAX_REQUESTS = 5;

export function rateLimit(
  key: string,
  windowMs: number = WINDOW_MS,
  maxRequests: number = MAX_REQUESTS,
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    cleanup();
    return {
      success: true,
      remaining: maxRequests - 1,
      resetAt: now + windowMs,
    };
  }

  if (entry.count >= maxRequests) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return {
    success: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

export function loginRateLimit(key: string): {
  success: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
} {
  const result = rateLimit(key, LOGIN_WINDOW_MS, LOGIN_MAX_REQUESTS);
  if (!result.success) {
    return {
      ...result,
      retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
    };
  }
  return { ...result, retryAfter: undefined };
}

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

setInterval(cleanup, WINDOW_MS);

export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return "unknown";
}
