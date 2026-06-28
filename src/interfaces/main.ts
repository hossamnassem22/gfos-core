import { MerchantRepository } from "../infrastructure/persistence/MerchantRepository.ts";
import { ReportService } from "./services/ReportService.ts";
import { connectDB } from "../infrastructure/database/postgres.ts";

const mRepo = new MerchantRepository();
const rSvc = new ReportService();

async function run() {
  await connectDB();

  const args = Deno.args;

  if (args[0] === "report" && args[1]) {
    const report = await rSvc.getMerchantDailyReport(args[1]);
    console.log("--- تقرير المبيعات اليومي ---");
    console.log(`إجمالي الطلبات: ${report.total_orders}`);
    console.log(`إجمالي المبيعات: ${report.total_sales} جنيه`);
  } else {
    console.log("الاستخدام: deno run main.ts report [merchant_id]");
  }
}

run().catch(console.error);

import { ledger } from "../core/ledger/Ledger.ts";

async function testLedger() {
  await ledger.post({
    debit: 10000,
    credit: 0,
    description: "دين جديد",
    tenantId: "tenant1"
  });
}
