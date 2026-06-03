import fc from 'fast-check';
import { OrderingRules } from '../packages/algebra/src/causality/Ordering';

const eventArb = fc.record({
  eventId: fc.uuid(),
  eventType: fc.constant('TRANSACTION'),
  payload: fc.object(),
  nodeId: fc.string(),
  sequenceNumber: fc.bigInt(1n, 1000n),
  parentHash: fc.oneof(fc.constant(null), fc.string({ minLength: 64, maxLength: 64 })),
  causalTime: fc.bigInt(1n, 1000000n),
  eventHash: fc.string({ minLength: 64, maxLength: 64 })
});

const suite = [
  { 
    name: 'Ordering Determinism', 
    property: fc.property(fc.array(eventArb), (events: any) => {
      const s1 = [...events].sort(OrderingRules.compare).map(e => e.eventId);
      const s2 = [...events].reverse().sort(OrderingRules.compare).map(e => e.eventId);
      return JSON.stringify(s1) === JSON.stringify(s2);
    })
  }
];

console.log("🛡️ Starting Full Property Pipeline...");
for (const test of suite) {
  try {
    fc.assert(test.property, { numRuns: 200 });
    console.log(`✅ PASSED: ${test.name}`);
  } catch (e) {
    console.error(`❌ FAILED: ${test.name}`);
    process.exit(1);
  }
}
console.log("🚀 PIPELINE STATUS: READY FOR KERNEL.");
process.exit(0);
