export class GlobalErrorHandler {
  static init() {
    window.addEventListener("error", (event) => {
      console.error("[CRITICAL] Uncaught Exception:", {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        timestamp: new Date().toISOString()
      });
      // هنا يمكن إضافة منطق إرسال التنبيهات (Alerting) إلى فريق العمليات
    });
  }
}
