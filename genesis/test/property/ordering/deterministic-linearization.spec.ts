import fc from 'fast-check';
import { OrderingRules } from '../../../packages/algebra/src/causality/Ordering';
import { eventArb } from '../generators';

describe('Deterministic Linearization', () => {
  it('should produce the same linear order regardless of input permutation', () => {
    fc.assert(
      fc.property(fc.array(eventArb), (events) => {
        const sorted1 = [...events].sort(OrderingRules.compare);
        const shuffled = [...events].reverse();
        const sorted2 = shuffled.sort(OrderingRules.compare);
        
        return JSON.stringify(sorted1) === JSON.stringify(sorted2);
      })
    );
  });
});
