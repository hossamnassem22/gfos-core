import { BaseEvent } from '../events/BaseEvent';
import { SaleRecorded } from '../events/SaleEvents';

export class InventoryProjection {
  // الحالة: مخزون كل منتج لكل تاجر
  private state: Record<string, number> = {};

  async handle(event: BaseEvent) {
    if (event.type === 'SaleRecorded') {
      const sale = event as SaleRecorded;
      const key = `${sale.tenantId}:${sale.productId}`;
      
      // تقليل المخزون تلقائياً بناءً على الحدث
      this.state[key] = (this.state[key] || 0) - sale.quantity;
    }
  }

  getStock(tenantId: string, productId: string): number {
    return this.state[`${tenantId}:${productId}`] || 0;
  }
}
