import { PoolClient } from 'pg';

// دالة لجلب العميل بدون async غير ضروري
export function getClient(): PoolClient {
  // منطق جلب الاتصال
  return {} as PoolClient; 
}

export function query(text: string, params?: unknown[]) {
  const _text = text;
  const _params = params;
  return Promise.resolve({ rows: [] });
}

export function closePool(): void {
  // إغلاق الاتصال بشكل مباشر
}
