import { BaseEvent } from '../events/BaseEvent';
import { DebtIssued } from '../events/DebtEvents';

export class DebtProjection {
  // الحالة: دين كل عميل لدى التاجر
  private debts: Record<string, number> = {};

  async handle(event: BaseEvent) {
    if (event.type === 'DebtIssued') {
      const debt = event as DebtIssued;
      const key = `${debt.tenantId}:${debt.customerId}`;
      this.debts[key] = (this.debts[key] || 0) + debt.amount;
    }
  }

  getDebt(tenantId: string, customerId: string): number {
    return this.debts[`${tenantId}:${customerId}`] || 0;
  }
}
