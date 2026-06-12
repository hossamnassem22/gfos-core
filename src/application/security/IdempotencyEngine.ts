import { db } from '../../infrastructure/db/connection';
import { idempotencyKeys } from '../../infrastructure/db/schema'; // سنضيف هذا الجدول
import { eq } from 'drizzle-orm';

export class IdempotencyEngine {
  async ensureUnique(key: string, action: () => Promise<void>): Promise<void> {
    const existing = await db.select().from(idempotencyKeys).where(eq(idempotencyKeys.key, key));
    
    if (existing.length > 0) {
      console.warn("⚠️ تم اكتشاف طلب متكرر! سيتم تجاهله:", key);
      return; // العملية نُفذت سابقاً
    }

    await action(); // تنفيذ العملية المالية
    
    await db.insert(idempotencyKeys).values({ key, createdAt: new Date() });
  }
}
