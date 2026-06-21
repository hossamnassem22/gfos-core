import { DashboardView } from "../modules/dashboard/DashboardView.ts";
import { transformLedgerToTable } from "../../../application/transformers/LedgerTransformer.ts";
import { getLedgerData } from "../../../application/services/ledgerService.ts";
import { checkSystemHealth } from "../../../application/services/healthService.ts";

export const getDashboardPage = async (req: Request) => {
  try {
    const ledgerData = await getLedgerData();
    const healthData = await checkSystemHealth();
    const tableData = transformLedgerToTable(ledgerData);
    
    return await DashboardView({
      revenue: "1.2M EGP",
      profit: "450K EGP",
      transactions: tableData,
      health: healthData // الحالة اللحظية للنظام
    });
  } catch (error) {
    return `<h1>System Error</h1><pre>${String(error)}</pre>`;
  }
};
