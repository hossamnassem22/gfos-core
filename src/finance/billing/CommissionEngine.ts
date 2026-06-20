export class CommissionEngine {
  private static rate = 0.02; // 2% رسوم المنصة

  static deductCommission(amount: number): number {
    const fee = amount * this.rate;
    console.log(`[FINANCE] Commission deducted: ${fee}`);
    return fee;
  }
}
