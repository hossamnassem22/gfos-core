export interface IdentityProfile {
  userId: string;
  role: 'ADMIN' | 'MANAGER' | 'ANALYST' | 'VIEWER';
  department: string;
  permissions: string[]; // قائمة الصلاحيات التفصيلية (مثال: 'approve_payment')
}
