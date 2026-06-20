export class PricingEngine {
  static calculateBill(usage: number, isPeakHour: boolean): number {
    const rate = isPeakHour ? 0.20 : 0.08; // السعر لكل كيلوواط
    return usage * rate;
  }
}
