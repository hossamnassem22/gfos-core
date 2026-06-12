import { BaseEvent } from '../events/BaseEvent';
import { SaleRecorded } from '../events/SaleEvents';

export class DailyReportProjection {
  private dailySales: Record<string, number> = {};

  async handle(event: BaseEvent) {
    if (event.type === 'SaleRecorded') {
      const sale = event as SaleRecorded;
      const today = new Date().toISOString().split('T')[0];
      const key = `${sale.tenantId}:${today}`;
      
      this.dailySales[key] = (this.dailySales[key] || 0) + (sale.price * sale.quantity);
    }
  }

  getDailyRevenue(tenantId: string): number {
    const today = new Date().toISOString().split('T')[0];
    return this.dailySales[`${tenantId}:${today}`] || 0;
  }
}
