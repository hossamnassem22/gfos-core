import { Money } from "./domain/ledger/Money.ts";
import { ProfitService } from "./application/services/ProfitService.ts";

async function runTest() {
  // رصيد بالريال السعودي
  const balanceSAR = new Money(500000n, "SAR"); // 5000 ريال
  
  console.log("--- تجربة نظام الربح متعدد العملات ---");
  const profit = await ProfitService.calculateAndDistribute("user_55", balanceSAR, 5.0);
  
  console.log(`تم توزيع الربح: ${profit.cents} ${profit.currency}`);
}

await runTest();
