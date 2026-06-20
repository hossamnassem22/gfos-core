export class BillingEngine {
  static calculateUsage(basePrice: number, units: number): number {
    if (units < 0) throw new Error("Units cannot be negative");
    return basePrice * units;
  }
}
