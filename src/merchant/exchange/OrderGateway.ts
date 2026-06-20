export interface PurchaseOrder {
  productId: string;
  quantity: number;
  priority: 'URGENT' | 'STANDARD';
}

export class OrderGateway {
  static submitToFactory(order: PurchaseOrder, factoryId: string) {
    console.log(`[EXCHANGE] Routing order to Factory: ${factoryId}`);
    // الربط المباشر مع موديول الجدولة في واجهة المصانع
  }
}
