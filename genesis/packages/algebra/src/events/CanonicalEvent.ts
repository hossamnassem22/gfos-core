export interface CanonicalEvent<TPayload> {
  readonly eventId: string;       // معرف فريد للحدث
  readonly eventType: string;     // نوع الحدث (للتفريق في المعالجة)
  readonly payload: TPayload;     // المحتوى الفعلي
  readonly nodeId: string;        // العقدة المنشئة
  readonly sequenceNumber: bigint;// الترتيب المحلي (Local Monotonic)
  readonly parentHash: string | null; // الرابط السببي
  readonly causalTime: bigint;    // وقت منطقي حتمي
  readonly eventHash: string;     // البصمة التشفيرية للحدث نفسه
}
