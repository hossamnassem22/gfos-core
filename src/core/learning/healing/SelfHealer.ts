import { KnowledgeBase } from "../knowledge/KnowledgeBase.ts";

export class SelfHealer {
  constructor(private kb: KnowledgeBase) {}

  async heal(errorCode: string) {
    const report = await this.kb.get(errorCode);
    if (report) {
      console.log(`[HEALING] Applying automated solution: ${report.solution}`);
      // تنفيذ الحل (مثل: إعادة ضبط إعدادات، تنظيف كاش، أو تغيير مسار)
    }
  }
}
