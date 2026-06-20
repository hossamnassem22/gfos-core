import { startPlatform } from './src/boot';
import { SystemCore } from './src/core/SystemCore';
import { orderRegistry } from './src/core/DataModel';

// 1. تشغيل المنصة
startPlatform();

// 2. محاكاة طلب تجاري ميداني
SystemCore.processNewOrder({
  id: "PROD-LIVE-001",
  retailerName: "التاجر الأول",
  factoryName: "المصنع المورد",
  product: "بضاعة تجريبية",
  quantity: 1,
  status: 'PENDING'
});

console.log(`[TEST] الحالة الحالية للنظام: ${orderRegistry.length} طلب.`);
