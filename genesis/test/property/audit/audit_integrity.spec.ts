import { assertEquals, assertNotEquals } from "https://deno.land/std/testing/asserts.ts";
import { AuditEngine } from "@kernel/AuditEngine.ts";
import { JournalEntry } from "@domain/ledger/JournalEntry.ts";

Deno.test("Audit Integrity: Detecting Ledger Tampering", async () => {
  const auditor = new AuditEngine();
  const entry = new JournalEntry("CASH", "DEBIT", 100);
  
  // 1. القيد الأصلي وبصمته
  const hash1 = await auditor.hashEntry(entry);
  
  // 2. محاولة تلاعب (تغيير المبلغ من 100 إلى 999)
  const tamperedEntry = new JournalEntry("CASH", "DEBIT", 999);
  const hash2 = await auditor.hashEntry(tamperedEntry);
  
  // 3. الشهادة: يجب أن تكون البصمات مختلفة
  assertNotEquals(hash1, hash2, "فشل التدقيق: النظام لم يكتشف التلاعب في البيانات!");
});
