export class RevenueGateway {
  static processTransactionFee(saleAmount: number): number {
    const platformFee = 0.005; // 0.5% رسوم تشغيل المنصة
    return saleAmount * platformFee;
  }
}
