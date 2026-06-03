import { LedgerCommitEngine } from '../../src/kernel/ledger/LedgerCommitEngine';

// 1. هيكل النتائج الدقيق
type StressResult = 'ACCEPTED' | 'REJECTED_DUPLICATE' | 'FAILED_INVALID_STATE';

// 2. الـ Orchestrator الذي يضمن determinism والـ Verification
export class StressOrchestrator {
  private results: StressResult[] = [];

  constructor(private engine: LedgerCommitEngine) {}

  async runScenario(concurrency: number, idempotencyKey: string) {
    // تشغيل متزامن تحت "Seed" ثابت (بافتراض تزامن محكوم)
    const promises = Array(concurrency).fill(null).map(async () => {
      try {
        await this.engine.commit({
          idempotencyKey,
          lines: [{ accountId: 'CASH', debit: 100n, credit: 100n }]
        });
        return 'ACCEPTED';
      } catch (e: any) {
        return e.message === 'DUPLICATE' ? 'REJECTED_DUPLICATE' : 'FAILED_INVALID_STATE';
      }
    });

    return await Promise.all(promises);
  }

  // 3. المحكم المالي (Financial Oracle)
  verifyOracle(results: StressResult[], finalLedgerCount: number) {
    const acceptedCount = results.filter(r => r === 'ACCEPTED').length;
    const invalidCount = results.filter(r => r === 'FAILED_INVALID_STATE').length;

    // Invariant: يجب قبول عملية واحدة فقط، والبقية يجب أن ترفض كـ duplicate
    if (acceptedCount !== 1) throw new Error("ORACLE_FAILURE: Multiple/Zero commits accepted");
    if (invalidCount > 0) throw new Error("ORACLE_FAILURE: Critical state corruption detected");
    
    return true;
  }
}
