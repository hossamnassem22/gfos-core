import { DashboardService } from "../../../application/services/dashboardService.ts";
import { DashboardPage } from "../pages/dashboard/dashboard.page.ts";
import { renderLayout } from "../layouts/dashboard.layout.ts";

export const getDashboardPage = async () => {
  const service = new DashboardService();
  
  // جلب البيانات من مصادرها (Application Service Layer)
  const stats = await service.getDashboardStats();
  const transactions = await service.getRecentTransactions();
  
  // دمج البيانات في الواجهة
  const pageContent = DashboardPage(stats, transactions);
  
  return renderLayout(pageContent);
};
