import { StateDeriver } from '../src/core/projection/StateDeriver';
import { FinancialEvent } from '../src/core/events/FinancialEvents';

describe('Deterministic Financial Engine Test', () => {
  it('should reconcile to zero balance after full payment cycle', async () => {
    // 1. تعريف سيناريو أحداث حتمي
    const events: FinancialEvent[] = [
      { id: 'e1', contractId: 'c1', type: 'CONTRACT_ACTIVATED', timestamp: new Date(), sequence: 1, payload: { date: new Date() } },
      { id: 'e2', contractId: 'c1', type: 'PAYMENT_RECEIVED', timestamp: new Date(), sequence: 2, payload: { amount: 5000n, date: new Date() } },
      { id: 'e3', contractId: 'c1', type: 'PAYMENT_RECEIVED', timestamp: new Date(), sequence: 3, payload: { amount: 5000n, date: new Date() } }
    ];

    // 2. الحالة الأولية (فرضاً المديونية 10000)
    const initialState = { outstandingBalance: 10000n, status: 'ACTIVE' };

    // 3. إعادة التشغيل الحتمي (Replay)
    const finalState = events.reduce((state, event) => {
        // نستخدم المنطق المدمج في StateDeriver
        return StateDeriver.reduce(state, event);
    }, initialState);

    // 4. التحقق (The Truth)
    expect(finalState.outstandingBalance).toBe(0n);
  });
});
