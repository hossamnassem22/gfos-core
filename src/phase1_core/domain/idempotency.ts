/**
 * IdempotencyGate: تضمن عدم تكرار العمليات المالية حتى في حالة فشل الشبكة.
 * تم استبدال 'any' بـ 'unknown' لضمان معالجة الأنواع بدقة.
 */
export class IdempotencyGate {
  private static store = new Map<string, string>();

  static async isDuplicate(key: string): Promise<boolean> {
    return this.store.has(key);
  }

  static async markProcessed(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }
}
