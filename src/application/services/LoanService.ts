import { Money } from "../../domain/ledger/Money.ts";
import { LedgerRepository } from "../../infrastructure/persistence/LedgerRepository.ts";

export class LoanService {
  constructor(private kv: Deno.Kv, private ledgerRepo: LedgerRepository) {}

  async processPaymentDue(userId: string, amount: Money, transactionId: string): Promise<void> {
    const tx = this.kv.atomic();
    
    tx.set(["notifications", transactionId], {
      userId,
      status: "PENDING",
      message: `قسطك بقيمة ${amount.cents} ${amount.currency} مستحق الآن.`,
      timestamp: Date.now()
    });

    const res = await tx.commit();
    
    if (!res.ok) {
      throw new Error("فشل ذريع: تعذر ربط الإشعار بالعملية المالية.");
    }

    console.log(`[ATOMIC SUCCESS]: Notification queued for ${userId}`);
  }
}
