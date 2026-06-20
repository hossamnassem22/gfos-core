export class AlertSystem {
  static report(module: string, error: string, phase: string) {
    console.error(`[ALERT] Module: ${module} | Phase: ${phase} | Issue: ${error}`);
    // إرسال التنبيه إلى لوحة تحكم الأدمن فوراً
  }
}
