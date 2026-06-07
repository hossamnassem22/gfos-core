import { PriceFeedService } from "./infrastructure/services/PriceFeedService.ts";
import { AuditLogger } from "./infrastructure/audit/AuditLogger.ts";

async function main() {
  console.log("=== بدء تشغيل GFOS-Core Engine ===");
  
  // 1. توثيق بدء النظام
  await AuditLogger.log("SYSTEM", "STARTUP", "تم تشغيل المحرك المالي بنجاح.");

  // 2. تفعيل محاكي أسعار الصرف (كل 15 ثانية)
  setInterval(async () => {
    try {
      await PriceFeedService.updateRates();
    } catch (error) {
      console.error("[ERROR]: فشل تحديث الأسعار:", error);
    }
  }, 15000);

  // 3. هنا يمكن إضافة استماع للطلبات (API Listener) مستقبلاً
  console.log("النظام يعمل الآن في الخلفية...");
}

main().catch(console.error);
