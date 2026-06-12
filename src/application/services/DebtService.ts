import { Debt } from '../../domain/debt/aggregates/Debt';
import { LedgerPostingService } from './LedgerPostingService';

export class DebtService {
  constructor(private ledger: LedgerPostingService) {}

  async postDebt(debt: Debt) {
    // 1. منطق التحقق من الدين
    debt.approve();

    // 2. طلب الترحيل من الـ Ledger
    const cmd = debt.getPostingCommand();
    await this.ledger.post({
      tenantId: debt.tenantId,
      ...cmd
    });

    // 3. تحديث حالة الدين محلياً
    debt.status = 'POSTED';
  }
}
