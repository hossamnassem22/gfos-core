import { CausalityInvariant } from '../../../packages/algebra/src/invariants/CausalityInvariant';
import fc from 'fast-check';

describe('Invalid Event Rejection (Negative Testing)', () => {
  it('should reject non-root events with missing parentHash', () => {
    fc.assert(
      fc.property(fc.bigInt(2n, 1000n), (seq) => {
        const invalidEvent = { sequenceNumber: seq, parentHash: null } as any;
        expect(() => CausalityInvariant.validate(invalidEvent)).toThrow("CAUSAL_LINK_VIOLATION");
      })
    );
  });

  it('should reject root events that provide a parentHash', () => {
    const invalidRoot = { sequenceNumber: 1n, parentHash: 'some-hash' } as any;
    expect(() => CausalityInvariant.validate(invalidRoot)).toThrow("ROOT_NODE_CANNOT_HAVE_PARENT");
  });
});
