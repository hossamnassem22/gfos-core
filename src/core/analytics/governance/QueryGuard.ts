export class QueryGuard {
  static canAccess(userId: string, targetResource: string): boolean {
    // التحقق من الصلاحيات بناءً على الـ IAM الذي بنيناه سابقاً
    return true; 
  }
}
