import { Money } from '../../domain/shared/Money';
import { LedgerPostingService } from '../services/LedgerPostingService';

export class InterestEngine {
  constructor(private ledger: LedgerPostingService) {}

  // حساب الفائدة اليومية: (Principal * Rate) / 365
  calculateDailyInterest(principal: bigint, annualRate: number): bigint {
    return (principal * BigInt(Math.floor(annualRate * 10000))) / 3650000n;
  }

  async accrueInterest(debtId: string, tenantId: string, principal: bigint, rate: number) {
    const interestAmount = this.calculateDailyInterest(principal, rate);

    // ترحيل قيد "استحقاق فائدة" (Accrual Entry)
    // Debit: Interest Receivable (أصل مستحق)
    // Credit: Interest Income (إيراد)
    await this.ledger.post({
      tenantId,
      sourceId: debtId,
      lines: [
        { accountId: 'INTEREST_RECEIVABLE', debit: interestAmount, credit: 0n },
        { accountId: 'INTEREST_INCOME', debit: 0n, credit: interestAmount }
      ]
    });
  }
}
