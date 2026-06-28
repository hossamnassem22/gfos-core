export class ReportService {
  async getMerchantDailyReport(merchantId: string) {
    console.log(`Generating report for merchant: ${merchantId}`);
    return {
      total_orders: 42,
      total_sales: 12500
    };
  }
}
