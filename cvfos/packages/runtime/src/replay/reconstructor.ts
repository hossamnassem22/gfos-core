import { PersistenceDriver } from '../../event-store/src/driver/interface';
import { GenesisKernel } from '../../../apps/execution-kernel/src/genesis';

export class StateReconstructor {
  constructor(
    private driver: PersistenceDriver,
    private kernel: GenesisKernel
  ) {}

  async reconstruct(): Promise<string> {
    let currentState = this.kernel.getInitialState();
    
    // قراءة متسلسلة من الـ Store
    const eventIterator = this.driver.readFrom(0n);

    for await (const storedEvent of eventIterator) {
      // إعادة التنفيذ (Deterministic Re-execution)
      currentState = this.kernel.transition(currentState, storedEvent.event);
    }

    // إرجاع الـ Hash النهائي للتحقق
    return this.kernel.computeStateHash(currentState);
  }
}
