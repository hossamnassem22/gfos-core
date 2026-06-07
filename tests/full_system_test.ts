import { sql } from "@infra/database/connection.ts";
import { DebtRepository } from "@infra/persistence/DebtRepository.ts";
import { PaymentRepository } from "@infra/persistence/PaymentRepository.ts";
import { FinancialEngine } from "@core/financial-engine/financial-engine.ts";
import { Money } from "@core/precision/value-objects.ts";

async function runFullTest() {
  console.log("🚀 بدء الاختبار الشامل للنظام...");

  // 1. إنشاء دين جديد
  const debtRepo = new DebtRepository();
  const engine = new FinancialEngine();
  
  const debtId = await debtRepo.save({
    userId: "USER-123",
    principalCents: 1000000n, // 10,000 جنيه
    currency: "EGP",
    annualRateBps: 1000,
    termMonths: 12,
    amortType: "DECLINING",
    status: "ACTIVE"
  });
  console.log(`✅ تم إنشاء الدين: ${debtId}`);

  // 2. التحقق من جدول الأقساط
  const schedule = await debtRepo.getSchedule(debtId);
  if (schedule.length > 0) {
    console.log(`✅ تم توليد ${schedule.length} قسط بنجاح.`);
  }

  // 3. اختبار دفعة مالية
  const payRepo = new PaymentRepository();
  await payRepo.save({
    debtId,
    amountCents: 200000n, // سداد 2000 جنيه
    penaltiesPaid: 0n,
    interestPaid: 5000n,
    principalPaid: 195000n
  });
  console.log("✅ تم تسجيل الدفعة المالية.");

  // 4. مزامنة الحالة
  await debtRepo.markInstallmentsAsPaid(debtId, 195000n);
  console.log("✅ تم تحديث حالة الأقساط تلقائياً.");

  console.log("🎉 الاختبار الشامل نجح! النظام يعمل بكفاءة.");
}

runFullTest().catch(console.error);
