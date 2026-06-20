export class FastSettlement {
  private static feeRate = 0.015; // 1.5% رسوم معالجة

  static processEarlyPayment(amount: number): number {
    const fee = amount * this.feeRate;
    const netAmount = amount - fee;
    console.log(`[FINANCE] Early payment processed. Platform Earned: ${fee}`);
    return netAmount;
  }
}
