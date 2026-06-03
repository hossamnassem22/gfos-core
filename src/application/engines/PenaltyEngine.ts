import { LedgerPostingService } from '../services/LedgerPostingService';

export class PenaltyEngine {
  constructor(private ledger: LedgerPostingService) {}

  async applyPenalty(debtId: string, tenantId: string, penaltyAmount: bigint) {
    // ترحيل قيد "غرامة"
    // Debit: Penalty Receivable
    // Credit: Penalty Income
    await this.ledger.post({
      tenantId,
      sourceId: debtId,
      lines: [
        { accountId: 'PENALTY_RECEIVABLE', debit: penaltyAmount, credit: 0n },
        { accountId: 'PENALTY_INCOME', debit: 0n, credit: penaltyAmount }
      ]
    });
  }
}
