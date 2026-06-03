/**
 * بروتوكول النسخ السببي
 * يضمن أن كل عقدة تعالج الأحداث بنفس الترتيب السببي الموثق في الـ DAG
 */
export interface CausalEvent {
  readonly event: GenesisEvent;
  readonly causalDeps: string[]; // قائمة هاشات الأحداث السابقة المعتمد عليها
  readonly senderId: string;
}

export class CausalReplicator {
  // مصفوفة انتظار (Buffer) للأحداث التي وصلت قبل اكتمال اعتمادياتها السببية
  private pendingQueue: CausalEvent[] = [];

  receive(event: CausalEvent) {
    if (this.isReady(event)) {
      this.process(event);
    } else {
      this.pendingQueue.push(event);
    }
  }

  private isReady(event: CausalEvent): boolean {
    // التحقق هل كل الـ causalDeps موجودة في الـ State Graph المحلي؟
    return event.causalDeps.every(dep => this.localGraph.has(dep));
  }
}
