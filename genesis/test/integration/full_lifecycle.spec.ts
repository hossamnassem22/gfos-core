import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { GenesisBootstrap } from "@src/GenesisBootstrap.ts";
import { SettlementEngine } from "@app/SettlementEngine.ts";
import { TransactionEngine } from "@app/TransactionEngine.ts";

Deno.test("Certification: Full Financial Lifecycle", async () => {
  const { committer } = await GenesisBootstrap.init();
  
  const settlement = new SettlementEngine();
  const transaction = new TransactionEngine();
  
  const agreement = { id: "PAY-001", totalAmount: 500 };
  
  // الآن plan يتوافق تماماً مع النوع المطلوب من Domain
  const plan = settlement.createPlan(agreement, 50000n);
  const entries = transaction.process(plan);
  
  await committer.commit(entries);
  
  assertEquals(entries.length > 0, true, "فشل التدفق المالي");
});
