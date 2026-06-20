export class SaleProcessor {
  static registerSale(productId: string, quantity: number, price: number) {
    console.log(`[POS] Sale recorded for product: ${productId}`);
    // 1. خصم الكمية من المخزون
    // 2. تسجيل العملية في سجل المبيعات اليومي
  }
}
