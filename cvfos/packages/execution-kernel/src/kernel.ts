import { DomainEvent } from '../../event-core/src/models';
import { LedgerCore } from '../../ledger-core/src/engine';
import { RuleEngine } from '../../rule-engine/src/engine';
import { LedgerTransaction } from '../../ledger-core/src/models';

export class ExecutionKernel {
  constructor(
    private ruleEngine: RuleEngine,
    private ledgerCore: LedgerCore
  ) {}

  /**
   * الدورة التنفيذية: الحدث يدخل، القانون يفسره، الأثر المالي يُسجل.
   * الكل في عملية واحدة (Atomic).
   */
  async execute(event: DomainEvent): Promise<LedgerTransaction> {
    try {
      // 1. التفسير المالي (Rule-based)
      const entries = this.ruleEngine.execute(event);

      // 2. التحويل والتحقق المحاسبي (Ledger-core)
      // هنا نقوم بدمج الحدث مع القيود المالية
      const transaction = this.ledgerCore.generate({
        ...event,
        entries
      });

      // 3. هنا سيأتي لاحقاً الربط بـ Persistence Layer (Atomic Write)
      return transaction;

    } catch (error) {
      // Failure Taxonomy (من الميثاق الذي وضعناه)
      throw new Error(`KERNEL_EXECUTION_FAILURE: ${error.message}`);
    }
  }
}
