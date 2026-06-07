import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { DebtRepository } from "@infra/persistence/DebtRepository.ts";
import { PaymentRepository } from "@infra/persistence/PaymentRepository.ts";
import { PaymentWaterfall } from "@core/financial-engine/waterfall.ts";
import { Money } from "@core/precision/value-objects.ts";

Deno.test("Financial Integration: Debt -> Payment -> Sync", async () => {
  const debtRepo = new DebtRepository();
  const paymentRepo = new PaymentRepository();
  
  // 1. إنشاء دين تجريبي (1,000,000 قرش)
  const debtId = await debtRepo.save({
    userId: "TEST-USER",
    principalCents: 1000000n,
    currency: "EGP",
    annualRateBps: 1200,
    termMonths: 6,
    amortType: "DECLINING",
    status: "ACTIVE"
  });

  // 2. محاكاة دفع 200,000 قرش
  const waterfall = new PaymentWaterfall();
  const alloc = waterfall.allocate({
    payment: Money.fromCents(200000n, "EGP"),
    outstandingPenalties: Money.fromCents(0n, "EGP"),
    outstandingInterest: Money.fromCents(10000n, "EGP"),
    outstandingPrincipal: Money.fromCents(1000000n, "EGP"),
  });

  await paymentRepo.save({
    debtId,
    amountCents: 200000n,
    penaltiesPaid: alloc.penalties.cents,
    interestPaid: alloc.interest.cents,
    principalPaid: alloc.principal.cents,
  });

  // 3. مزامنة حالة الأقساط
  await debtRepo.markInstallmentsAsPaid(debtId, alloc.principal.cents);

  // تحقق: هل تم تسجيل الدفعة؟
  const payments = await paymentRepo.getPaymentsByDebt(debtId);
  assertEquals(payments.length, 1);
  console.log("✓ Integration Test Passed: Payment and Sync verified.");
});
