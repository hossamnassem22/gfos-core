import fc from 'fast-check';
import { OrderingRules } from '../../../packages/algebra/src/causality/Ordering';
import { GenesisKernel } from '../../../packages/kernel/src/Kernel';

const eventArb = fc.record({
  eventId: fc.uuid(),
  eventType: fc.constant('TRANSACTION'),
  payload: fc.record({ amount: fc.integer({ min: 1, max: 100 }) }),
  nodeId: fc.string(),
  sequenceNumber: fc.bigInt(1n, 1000n),
  parentHash: fc.oneof(fc.constant(null), fc.string({ minLength: 64, maxLength: 64 })),
  causalTime: fc.bigInt(1n, 1000000n),
  eventHash: fc.string({ minLength: 64, maxLength: 64 })
});

console.log("🔄 Starting Deterministic Integration Stress Test...");

try {
  fc.assert(
    fc.property(fc.array(eventArb), (events: any) => {
      const kernel1 = new GenesisKernel();
      [...events].sort(OrderingRules.compare).forEach(e => kernel1.apply(e));

      const kernel2 = new GenesisKernel();
      [...events].reverse().sort(OrderingRules.compare).forEach(e => kernel2.apply(e));

      const state1 = kernel1.getState();
      const state2 = kernel2.getState();

      return state1.balance === state2.balance && state1.lastEventId === state2.lastEventId;
    }),
    { numRuns: 500 }
  );
  console.log("✅ INTEGRATION SUCCESS: System is Deterministic.");
  process.exit(0);
} catch (err) {
  console.error("❌ INTEGRATION FAILURE: State Divergence Detected.");
  process.exit(1);
}
