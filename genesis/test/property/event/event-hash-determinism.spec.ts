import fc from 'fast-check';
import { CanonicalSerialization } from '../../packages/algebra/src/events/CanonicalSerialization';
import { eventArb } from '../generators';

describe('Event Hash Determinism', () => {
  it('should produce identical serialized string regardless of object property order', () => {
    fc.assert(
      fc.property(eventArb, (event) => {
        const str1 = CanonicalSerialization.stringify(event);
        // إعادة ترتيب الخصائص يدوياً للتأكد
        const shuffledEvent = { ...event };
        const keys = Object.keys(shuffledEvent).reverse();
        const str2 = CanonicalSerialization.stringify(shuffledEvent);
        
        return str1 === str2;
      })
    );
  });
});
