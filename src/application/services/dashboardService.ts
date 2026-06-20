import { DashboardStat } from "../../shared/types/dashboard.ts";
import { Transaction } from "../../shared/types/transaction.ts";

export class DashboardService {
  async getDashboardStats(): Promise<DashboardStat[]> {
    return [
      { title: "الإيرادات", value: "1.2M EGP", color: "blue" },
      { title: "الطلبات", value: "48", color: "green" },
      { title: "الشحنات", value: "12", color: "purple" },
      { title: "المعلقة", value: "5", color: "red" }
    ];
  }

  async getRecentTransactions(): Promise<Transaction[]> {
    return [
      { id: "1", client: "شركة النور", type: "توريد", status: "مكتمل", date: "2026-06-20" },
      { id: "2", client: "مؤسسة الأمل", type: "صيانة", status: "قيد التنفيذ", date: "2026-06-19" }
    ];
  }
}
