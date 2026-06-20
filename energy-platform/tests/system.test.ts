// اختبار بسيط للتأكد من ربط الموديولات
import { AccessController } from '../src/admin/rbac/AccessController';

test('Admin should have access to Factory module', () => {
  AccessController.grantAccess('ADMIN_001', ['FACTORY']);
  expect(AccessController.hasAccess('ADMIN_001', 'FACTORY')).toBe(true);
});
