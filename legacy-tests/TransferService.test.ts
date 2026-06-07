import { assertEquals } from "@std/assert";
import { LedgerRepository } from "../../infrastructure/persistence/LedgerRepository.ts";
import { TransferService } from "./TransferService.ts";
import { WalletService } from "./WalletService.ts";
import { LedgerEntry, EntryType } from "../../domain/ledger/LedgerEntry.ts";
import { Money } from "../../domain/ledger/Money.ts";

Deno.test("TransferService: Should move money between two users", async () => {
  const repo = new LedgerRepository();
  const transferService = new TransferService(repo);
  const walletService = new WalletService(repo);
  
  const fromUser = "user_A";
  const toUser = "user_B";

  // إيداع مبدئي للمرسل
  await repo.save(LedgerEntry.create(fromUser, "MAIN_ACC", Money.fromCents(1000n), EntryType.DEBIT));

  // تنفيذ التحويل
  await transferService.transfer(fromUser, toUser, 300n);

  // التأكد من الأرصدة
  assertEquals(await walletService.getBalance(fromUser), 700n);
  assertEquals(await walletService.getBalance(toUser), 300n);
});
