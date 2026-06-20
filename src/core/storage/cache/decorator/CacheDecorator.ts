import { CacheProvider } from "../provider/CacheProvider.ts";
import { CacheKeyGenerator } from "../keys/CacheKeyGenerator.ts";

export class CacheDecorator {
  constructor(private provider: CacheProvider) {}

  async wrap<T>(scope: string, id: string, fetcher: () => Promise<T>): Promise<T> {
    const key = CacheKeyGenerator.generate(scope, id);
    const cached = await this.provider.get<T>(key);
    if (cached) return cached;

    const fresh = await fetcher();
    await this.provider.set(key, fresh, 3600); // افتراض 1 ساعة
    return fresh;
  }
}
