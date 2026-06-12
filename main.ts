import { MerchantRepository } from "@infra/persistence/MerchantRepository.ts";
import { ReportService } from "@src/services/ReportService.ts";

const mRepo = new MerchantRepository();
const rSvc = new ReportService();

async function run() {
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

run();
