export interface Prover<S, E> {
  // دالة التوقع: بناءً على الحالة الحالية والحدث، ما هي الحالة التالية؟
  predict(s: S, e: E): S;
  
  // مقارنة الحالة الحقيقية بالحالة المتوقعة
  verify(actual: S, predicted: S): boolean;
}
