import { BaseEvent } from '../events/BaseEvent';
import { SaleRecorded } from '../events/SaleEvents';

export class ProfitProjection {
  private dailyProfits: Record<string, number> = {};

  async handle(event: BaseEvent) {
    if (event.type === 'SaleRecorded') {
      const sale = event as SaleRecorded;
      const dateKey = new Date().toISOString().split('T')[0];
      const key = `${sale.tenantId}:${dateKey}`;
      
      // هنا سنحتاج لاحقاً لربط السعر بالتكلفة (Cost)
      // حالياً نحسب إجمالي المبيعات كبداية
      this.dailyProfits[key] = (this.dailyProfits[key] || 0) + (sale.price * sale.quantity);
    }
  }

  getProfit(tenantId: string): number {
    const dateKey = new Date().toISOString().split('T')[0];
    return this.dailyProfits[`${tenantId}:${dateKey}`] || 0;
  }
}
