import { LoanService } from "./application/services/LoanService.ts";
import { NotificationWorker } from "./infrastructure/workers/NotificationWorker.ts";
import { LedgerRepository } from "./infrastructure/persistence/LedgerRepository.ts";
import { Money } from "./domain/ledger/Money.ts";

// إعداد البيئة
const kv = await Deno.openKv();
const ledgerRepo = new LedgerRepository();
const loanService = new LoanService(kv, ledgerRepo);
const worker = new NotificationWorker(kv);

async function runExperiment() {
  console.log("--- بدء تجربة النظام المالي: العملية + الإشعار ---");
  
  const txId = crypto.randomUUID();
  const amount = Money.fromCents(5000n, "EGP");

  // 1. تنفيذ العملية المالية (Atomic)
  await loanService.processPaymentDue("user_99", amount, txId);

  // 2. تشغيل المعالج (Worker) لإرسال الإشعار
  console.log("جارٍ معالجة الإشعارات...");
  await worker.processPendingNotifications();
  
  console.log("--- انتهت التجربة بنجاح ---");
}

await runExperiment();
Deno.exit();
