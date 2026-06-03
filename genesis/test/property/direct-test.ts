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

console.log("🚀 Starting Genesis Algebra Property Test...");

try {
  fc.assert(
    fc.property(fc.array(eventArb), (events) => {

      const sorted1 =
        [...events].sort(OrderingRules.compare);

      const sorted2 =
        [...events]
          .reverse()
          .sort(OrderingRules.compare);

      return JSON.stringify(sorted1)
        === JSON.stringify(sorted2);
    }),
    {
      numRuns: 500
    }
  );

  console.log(
    "✅ SUCCESS: Ordering Determinism Verified."
  );

  process.exit(0);

} catch (err) {

  console.error(
    "❌ FAILURE: Determinism Violated."
  );

  console.error(err);

  process.exit(1);
}
