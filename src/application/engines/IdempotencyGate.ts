import { db } from '../../infrastructure/db/connection';
import { idempotencyKeys } from '../../infrastructure/db/schema'; // سننشئ هذا الجدول
import { eq } from 'drizzle-orm';

export class IdempotencyGate {
  static async execute<T>(key: string, task: () => Promise<T>): Promise<T> {
    return await db.transaction(async (tx) => {
      // 1. محاولة القفل (Strict Gate)
      const existing = await tx.select().from(idempotencyKeys).where(eq(idempotencyKeys.key, key)).for('UPDATE' as any);
      
      if (existing.length > 0) {
        // إذا كان موجوداً، نسترجع النتيجة المخزنة
        return existing[0].response as T;
      }

      // 2. التنفيذ
      const result = await task();

      // 3. تخزين النتيجة لضمان عدم التكرار مستقبلاً
      await tx.insert(idempotencyKeys).values({ key, response: result });
      
      return result;
    });
  }
}
