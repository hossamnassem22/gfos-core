export interface Metric {
  name: string;        // اسم المقياس (مثلاً: request_latency)
  value: number;       // القيمة المقاسة
  labels: Record<string, string>; // وسوم لتصنيف البيانات (tenant_id, endpoint)
  timestamp: string;
}
