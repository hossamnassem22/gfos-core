/**
 * GlobalState يجب أن يكون قابلاً للتسلسل (Serializable)
 * لضمان أن الـ StateHash يعطي دائماً نفس النتيجة (Deterministic).
 */
export interface GlobalState {
  // نستخدم Record بدلاً من Map لضمان إمكانية التحويل لـ JSON
  readonly ledger: Record<string, string>; // نستخدم string للأرقام الكبيرة (BigInt) لضمان التوافق
  readonly sequence: string;           // نستخدم string لتفادي مشاكل الـ JSON مع BigInt
  readonly stateHash: string;          // البصمة الوراثية
}

// دالة الانتقال الرياضية: f(S, E) -> S'
export type TransitionFunction = (s: GlobalState, e: any) => GlobalState;
