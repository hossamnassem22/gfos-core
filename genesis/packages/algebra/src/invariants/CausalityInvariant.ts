import { CanonicalEvent } from '../events/CanonicalEvent';

export class CausalityInvariant {
  static validate(event: CanonicalEvent<any>): void {
    // التحقق من وجود المعرفات
    if (!event.eventId || !event.nodeId) throw new Error("MISSING_IDENTITY_IDENTITY");
    
    // التحقق من أن السلسلة لا تبدأ بـ parentHash غير صحيح
    if (event.sequenceNumber === 1n && event.parentHash !== null) {
      throw new Error("ROOT_NODE_CANNOT_HAVE_PARENT");
    }
    
    // التحقق من أن أي حدث لاحق يجب أن يملك parentHash
    if (event.sequenceNumber > 1n && !event.parentHash) {
      throw new Error("NON_ROOT_NODE_MUST_HAVE_PARENT");
    }
  }
}
