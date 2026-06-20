export class MemoryCache<T> {
  private store = new Map<string, { data: T; expiry: number }>();

  set(key: string, data: T, ttl: number) {
    this.store.set(key, { data, expiry: Date.now() + ttl });
  }

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry || Date.now() > entry.expiry) return null;
    return entry.data;
  }
}
