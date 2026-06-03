import { CanonicalEvent } from '../events/CanonicalEvent';

export class OrderingRules {
  /**
   * قاعدة الترتيب الحتمي: تحويل الـ DAG إلى Linear Log
   */
  static compare(a: CanonicalEvent<any>, b: CanonicalEvent<any>): number {
    // 1. الترتيب حسب الوقت السببي
    if (a.causalTime !== b.causalTime) return Number(a.causalTime - b.causalTime);
    
    // 2. إذا تساوى الوقت، الترتيب حسب الـ Sequence (داخل العقدة)
    if (a.sequenceNumber !== b.sequenceNumber) return Number(a.sequenceNumber - b.sequenceNumber);
    
    // 3. كسر التعادل (Tie-breaking) باستخدام nodeId ثم eventId
    const nodeDiff = a.nodeId.localeCompare(b.nodeId);
    if (nodeDiff !== 0) return nodeDiff;
    
    return a.eventId.localeCompare(b.eventId);
  }
}
