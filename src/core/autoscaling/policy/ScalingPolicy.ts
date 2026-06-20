export interface ScalingPolicy {
  threshold: number;      // حد الاستخدام (مثلاً: 80% CPU)
  cooldownSeconds: number; // زمن الانتظار بعد كل عملية توسع
  minInstances: number;
  maxInstances: number;
}
