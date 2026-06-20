export interface SettlementContract {
  merchantId: string;
  commissionRate: number; // النسبة المقتطعة
  payoutFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
}

export class SettlementRules {
  static calculateNet(gross: number, rate: number): number {
    return gross * (1 - rate);
  }
}
