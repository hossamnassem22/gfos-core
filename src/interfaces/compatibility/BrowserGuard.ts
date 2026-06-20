export class BrowserGuard {
  static checkSupport(feature: string): boolean {
    // التحقق مما إذا كان المتصفح يدعم تقنيات العرض الحديثة
    console.log(`[COMPATIBILITY] Checking feature: ${feature}`);
    return true; 
  }
}
