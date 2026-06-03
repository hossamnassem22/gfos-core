import { ExecutionKernel } from '../../execution-kernel/src/kernel';
import { GoldenStreams } from './scenarios/golden-streams';
import { LedgerCore } from '../../ledger-core/src/engine';

export class TestRunner {
  constructor(private kernel: ExecutionKernel, private ledger: LedgerCore) {}

  async runScenario(scenarioKey: string): Promise<{ success: boolean; hash: string }> {
    const scenario = GoldenStreams[scenarioKey];
    if (!scenario) throw new Error(`Scenario ${scenarioKey} not found`);

    console.log(`[TEST RUNNER] Executing: ${scenario.name}`);

    // 1. تنفيذ الـ Stream
    for (const event of scenario.events) {
      await this.kernel.execute(event);
    }

    // 2. استخراج الحالة النهائية للدفتر وحساب الـ Hash
    const finalState = await this.ledger.getGlobalStateHash(); 
    
    // 3. التحقق من الحتمية
    const success = finalState === scenario.expectedFinalHash;
    
    return { success, hash: finalState };
  }
}
