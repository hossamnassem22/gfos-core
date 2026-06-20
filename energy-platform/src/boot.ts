import { loadState } from './core/PersistenceService';
import { orderRegistry } from './core/DataModel';
import { auditLog } from './lean/docs/AuditTrail';

export const startPlatform = () => {
  console.log("--- جاري إقلاع المنصة الميدانية ---");
  
  // استرجاع البيانات من الخادم (الملف أو الذاكرة)
  const state = loadState();
  
  if (state.orders && Array.isArray(state.orders)) {
    // تفريغ البيانات القديمة وتحميل الجديدة
    orderRegistry.length = 0;
    orderRegistry.push(...state.orders);
  }
  
  if (state.audit && Array.isArray(state.audit)) {
    auditLog.length = 0;
    auditLog.push(...state.audit);
  }

  console.log(`[STATUS] المنصة جاهزة: ${orderRegistry.length} طلب في السجل.`);
};
