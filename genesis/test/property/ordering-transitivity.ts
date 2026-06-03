import fc from 'fast-check';
import { OrderingRules } from '../../packages/algebra/src/causality/Ordering';
import { CanonicalEvent } from '../../packages/algebra/src/events/CanonicalEvent';

const eventArb: fc.Arbitrary<CanonicalEvent<any>> =
  fc.record({
    eventId: fc.uuid(),
    eventType: fc.string(),
    payload: fc.anything(),
    nodeId: fc.string(),
    sequenceNumber: fc.bigInt({ min: 1n, max: 1000n }),
    parentHash: fc.option(fc.string(), { nil: null }),
    causalTime: fc.bigInt({ min: 1n, max: 1000000n }),
    eventHash: fc.string()
  });

console.log("🚀 Testing Ordering Transitivity");

fc.assert(
  fc.property(
    eventArb,
    eventArb,
    eventArb,
    (a,b,c) => {

      const ab = OrderingRules.compare(a,b);
      const bc = OrderingRules.compare(b,c);
      const ac = OrderingRules.compare(a,c);

      if (ab <= 0 && bc <= 0) {
        return ac <= 0;
      }

      return true;
    }
  ),
  { numRuns: 1000 }
);

console.log("✅ Transitivity Verified");
