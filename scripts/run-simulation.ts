import { PostPayment } from './src/application/use-cases/PostPayment';

try {
  console.log("--- بدء تشغيل GFOS Core (Production Simulation) ---");
  
  // تنفيذ عملية دفع حقيقية
  const paymentEntry = PostPayment.execute(
    'TXN-999',
    'TENANT-001',
    5000,
    'CASH_ACC',
    'REVENUE_ACC'
  );

  console.log("حالة العملية:", paymentEntry.status);
  console.log("--- اكتملت العملية المالية بنجاح ---");

} catch (error: any) {
  console.error("❌ فشل النظام المالي: " + error.message);
}
