import { CanonicalEvent } from '../events/CanonicalEvent';

export class OrderingRules {

  static compare(a: CanonicalEvent<any>, b: CanonicalEvent<any>): number {

    // 1. nodeId first (deterministic partition ordering)
    if (a.nodeId !== b.nodeId)
      return a.nodeId > b.nodeId ? 1 : -1;

    // 2. sequenceNumber (causal sequence inside node)
    if (a.sequenceNumber !== b.sequenceNumber)
      return a.sequenceNumber > b.sequenceNumber ? 1 : -1;

    // 3. causalTime (logical time fallback)
    if (a.causalTime !== b.causalTime)
      return a.causalTime > b.causalTime ? 1 : -1;

    // 4. eventHash (final tie-breaker ensures total order)
    if (a.eventHash !== b.eventHash)
      return a.eventHash > b.eventHash ? 1 : -1;

    return 0;
  }
}
