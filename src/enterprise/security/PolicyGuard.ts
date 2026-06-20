export class PolicyGuard {
  static checkAccess(department: string, action: string): boolean {
    // التحقق من سياسات الوصول الخاصة بالشركة
    const policies = { 'FINANCE': ['read', 'approve'], 'HR': ['read'] };
    return policies[department]?.includes(action) ?? false;
  }
}
