export class IncentivePolicy {
  static applyDiscount(score: number): number {
    return score > 90 ? 0.05 : 0; // خصم 5% إذا كان التاجر مميزاً
  }
}
