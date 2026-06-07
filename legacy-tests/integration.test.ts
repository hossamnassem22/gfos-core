import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { TransferService } from "../application/services/TransferService.ts";
import { LedgerRepository } from "../infrastructure/persistence/LedgerRepository.ts";
import { WalletService } from "../application/services/WalletService.ts";
import { Money } from "../domain/ledger/Money.ts";

Deno.test("اختبار التحويل الذكي بين العملات", async () => {
  const ledgerRepo = new LedgerRepository();
  const walletService = new WalletService(ledgerRepo);
  const transferService = new TransferService(ledgerRepo, walletService);

  // إيداع 100 USD
  const amountUSD = Money.fromCents(100n, "USD");
  
  // تحويل لـ EGP (سيقوم النظام بتحويل الـ 100 دولار إلى القيمة المقابلة بالجنيه)
  await transferService.transfer("user1", "user2", amountUSD, "EGP");
  
  // التحقق من القيم المحولة (بناءً على سعر الصرف المعرف في ExchangeService)
  // ...
});
