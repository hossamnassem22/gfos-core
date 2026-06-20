export class StockSync {
  static syncInventory(productId: string, quantity: number) {
    console.log(`[WAREHOUSE] Syncing product ${productId} with quantity ${quantity}`);
    // تحديث قاعدة البيانات المركزية لضمان تطابق الأرصدة
  }
}
