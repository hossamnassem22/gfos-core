import { CanonicalEvent } from '../../algebra/src/events/CanonicalEvent';

export interface SystemState {
  balance: bigint;
  lastEventId: string | null;
}

export class GenesisKernel {
  private state: SystemState = { balance: 0n, lastEventId: null };

  // تطبيق منطق الانتقال بناءً على الحدث (Transaction Logic)
  apply(event: CanonicalEvent<any>): void {
    // تطبيق القاعدة الحتمية: التحديث يعتمد فقط على قيمة الحدث
    if (event.eventType === 'TRANSACTION') {
      const amount = BigInt(event.payload.amount || 0);
      this.state.balance += amount;
      this.state.lastEventId = event.eventId;
    }
  }

  getState(): SystemState {
    return { ...this.state };
  }
}
