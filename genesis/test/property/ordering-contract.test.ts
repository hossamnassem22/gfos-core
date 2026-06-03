import fc from 'fast-check';
import { OrderingRules } from '../../packages/algebra/src/causality/Ordering';
import { CanonicalEvent } from '../../packages/algebra/src/events/CanonicalEvent';

const arb: fc.Arbitrary<CanonicalEvent<any>> =
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

const eventsArb = fc.array(arb, { minLength: 1, maxLength: 50 });

console.log("🚀 Ordering Contract Test Running");

fc.assert(
  fc.property(eventsArb, (events) => {

    const sorted = [...events].sort(OrderingRules.compare);

    // 1. idempotence: sorting twice = same result
    const sorted2 = [...sorted].sort(OrderingRules.compare);

    // 2. stability: order must not change
    const s1 = JSON.stringify(sorted);
    const s2 = JSON.stringify(sorted2);

    return s1 === s2;
  }),
  { numRuns: 500 }
);

console.log("✅ Ordering Contract OK");
