// النواة المركزية للمنصة
import { EscrowContract } from './finance/escrow/EscrowContract';
import { AccessController } from './admin/rbac/AccessController';

console.log("[SYSTEM] Starting Central Engine...");

// إعداد الأدمن الافتراضي
AccessController.grantAccess('ADMIN_001', ['FACTORY', 'RETAIL', 'FINANCE', 'LOGISTICS']);

// اختبار جاهزية موديول الضمان المالي
EscrowContract.createDeal('DEAL_X77', 50000);

console.log("[SYSTEM] All modules initialized and ready.");
