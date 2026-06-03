// كل حدث هو عنصر في مجموعة (Set of Events) مع عملية دمج (Composition)
export interface EventAlgebra<T> {
  // دالة الدمج: (E1 + E2 = E3)
  // يجب أن تحقق خاصية الدمج (Associativity): (E1 + E2) + E3 = E1 + (E2 + E3)
  compose(a: T, b: T): T;
  
  // العنصر المحايد (Identity Event): النظام لا يتغير
  identity(): T;
  
  // المعكوس الرياضي: (E + (-E) = Identity)
  // يضمن قدرتنا على تنفيذ "التراجع" (Reversal) بدون فساد
  invert(a: T): T;
}
