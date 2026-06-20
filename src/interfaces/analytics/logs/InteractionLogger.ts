export class InteractionLogger {
  static track(action: string, componentId: string) {
    console.log(`[UX-LOG] User action: ${action} on ${componentId}`);
    // إرسال البيانات إلى MetricsCollector
  }
}
