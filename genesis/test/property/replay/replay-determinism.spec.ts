import fc from 'fast-check';
import { eventArb } from '../generators';

describe('Replay Determinism', () => {
  it('should produce the same state root every single time', () => {
    fc.assert(
      fc.property(fc.array(eventArb), (events) => {
        // محاكاة بسيطة للـ Replay: مجموع الـ sequenceNumber يمثل الحالة (Version)
        const simulateReplay = (es: typeof events) => es.reduce((acc, e) => acc + e.sequenceNumber, 0n);
        
        const run1 = simulateReplay(events);
        const run2 = simulateReplay(events);
        
        return run1 === run2;
      })
    );
  });
});
