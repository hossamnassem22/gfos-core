import { DomainEvent } from '../../shared/contracts/EventContracts';
import { ExecutionKernel } from '../ledger-kernel/ExecutionKernel';
import { Snapshot } from './SnapshotEngine';

export class ReplayEngine {
  constructor(private kernel: ExecutionKernel) {}

  // استعادة الحالة بالكامل من نقطة محددة
  async replay(events: DomainEvent[], snapshot?: Snapshot): Promise<any> {
    let currentState = snapshot ? snapshot.data : {};

    for (const event of events) {
      // الـ Kernel هنا ينفذ الـ Logic في وضع "Replay Mode"
      // حيث يتم تجاهل الـ Circuit Breaker أو تفعيله حسب الرغبة
      await this.kernel.executeInReplayMode(event);
    }
    
    return currentState;
  }
}
