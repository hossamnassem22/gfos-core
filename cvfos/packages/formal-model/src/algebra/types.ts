/**
 * تعريف الحدث كعنصر في Monoid
 * S: نوع الحالة
 * E: نوع الحدث
 */
export interface EventAlgebraic<S, E> {
  // العنصر المحايد (Identity Event):
  // الحدث الذي لا يغير الحالة نهائياً (E0 + S = S)
  identity(): E;

  // عملية الدمج (Composition):
  // كيفية دمج حدثين في حدث واحد مكافئ (E1 + E2 = E3)
  compose(e1: E, e2: E): E;

  // عملية الانعكاس (Inversion):
  // لكل عملية مالية (إيداع) هناك عملية معاكسة (سحب)
  // تضمن أن (E + Inv(E) = Identity)
  invert(e: E): E;
}
