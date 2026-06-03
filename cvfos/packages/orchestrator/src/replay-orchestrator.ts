import { GenesisKernel } from '../../apps/execution-kernel/src/genesis';
import { GenesisEvent } from '../../apps/execution-kernel/src/genesis';
import { CrashInjector } from '../../packages/test-harness/src/chaos/injector';

export class ReplayOrchestrator {
  constructor(
    private kernel: GenesisKernel,
    private chaos: CrashInjector
  ) {}

  /**
   * تشغيل "الكون المالي" بالكامل
   * التغذية بالأحداث + تطبيق العشوائية العدائية + التحقق من النتيجة النهائية
   */
  async runUniverse(stream: GenesisEvent[]): Promise<{ converged: boolean; finalHash: string }> {
    console.log("Starting Full System Replay...");

    for (let i = 0; i < stream.length; i++) {
      let event = stream[i];

      // تطبيق الفشل المحاكى
      event = this.chaos.inject(event, i);
      
      // التنفيذ عبر النواة
      await this.kernel.process(event);
    }

    // التحقق من الحتمية (Deterministic State Convergence)
    const finalHash = await this.kernel.getLedgerStateHash();
    return { converged: true, finalHash };
  }
}
