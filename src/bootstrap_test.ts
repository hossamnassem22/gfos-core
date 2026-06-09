import { JournalRepository } from "./infrastructure/persistence/JournalRepository.ts";
import { JournalEngine } from "./core/ledger/JournalEngine.ts";
import { FinancialPeriodService } from "./domain/ledger/FinancialPeriodService.ts";

async function runSanityCheck() {
  console.log("--- Starting Accounting Kernel Sanity Check ---");
  const tenantId = "sanity_check_tenant";
  const repo = new JournalRepository();
  const periodService = new FinancialPeriodService();

  try {
    // 1. إنشاء قيد
    const entry = JournalEngine.createPaymentEntry({
      tenantId,
      reference: "SANITY_001",
      currency: "EGP",
      amountCents: 50000n,
      principalCents: 50000n,
      interestCents: 0n,
      penaltiesCents: 0n
    });

    await repo.save(entry);
    console.log("✓ Journal Entry saved successfully.");

    // 2. التحقق من التوازن
    const tb = await repo.getTrialBalance(tenantId);
    console.log("✓ Trial Balance retrieved. Records:", tb.length);

    console.log("--- Sanity Check Completed Successfully ---");
  } catch (err) {
    console.error("✗ Sanity Check Failed:", err);
  }
}

await runSanityCheck();
