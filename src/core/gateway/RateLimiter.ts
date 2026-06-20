const store = new Map<string, { count: number; resetAt: number }>();

export class RateLimiter {
  static check(key: string, limit: number, windowMs: number) {
    const now = Date.now();

    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
      store.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return true;
    }

    if (entry.count >= limit) {
      throw new Error("RATE_LIMIT_EXCEEDED");
    }

    entry.count += 1;
    return true;
  }
}
