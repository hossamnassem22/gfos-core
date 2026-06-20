import { loadState } from './core/PersistenceService';
import { orderRegistry } from './core/DataModel';
import { auditLog } from './lean/docs/AuditTrail';

// استرجاع البيانات المخزنة في خادم الهاتف فور بدء التشغيل
const savedData = loadState();
orderRegistry.push(...savedData.orders);
auditLog.push(...savedData.audit);

console.log("[SYSTEM] الخادم جاهز. تم استعادة البيانات.");
