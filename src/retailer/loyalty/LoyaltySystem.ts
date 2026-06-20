export class LoyaltySystem {
  static calculatePoints(purchaseValue: number): number {
    const pointRatio = 0.1; // 10% من قيمة المشتريات كنقاط
    return purchaseValue * pointRatio;
  }
}
