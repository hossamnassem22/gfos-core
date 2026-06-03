import { EvidenceBundle } from '../../test-harness/src/integrity/reporter';

export class AuditBridge {
  constructor(private publisher: any) {}

  /**
   * إرسال حزمة الأدلة إلى الـ Regulatory Feed
   * هذا هو التوقيع الأخير للنظام قبل الإنتاج
   */
  async publish(bundle: EvidenceBundle): Promise<void> {
    // التحقق من أن الحزمة موقعة ومكتملة قبل النشر
    if (!bundle.integrityReport.signature) {
      throw new Error("UNSIGNED_EVIDENCE_CANNOT_BE_PUBLISHED");
    }

    // إرسال الحزمة إلى الـ Audit Stream الخارجي (مثل Kafka أو Immutable Ledger)
    await this.publisher.send('regulatory.truth.feed', bundle);
    
    console.log("Evidence bundle published: ", bundle.integrityReport.reportId);
  }
}
