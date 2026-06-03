import { LedgerCommitEngine } from '../../src/kernel/ledger/LedgerCommitEngine';
import { IdempotencyGate } from '../../src/kernel/ledger/IdempotencyGate';

// محاكي الهجمات المالية
export async function runStressTest(engine: LedgerCommitEngine, concurrency: number) {
  const tasks = Array(concurrency).fill(null).map((_, i) => {
    return engine.commit({
      idempotencyKey: 'TX-KEY-1', // مفتاح متكرر لاختبار الـ Lock
      lines: [{ accountId: 'CASH', debit: 100n, credit: 0n }, { accountId: 'AR', debit: 0n, credit: 100n }]
    });
  });

  const results = await Promise.allSettled(tasks);
  
  // التحقق من أن عملية واحدة فقط نجحت (بسبب الـ Idempotency)
  const successes = results.filter(r => r.status === 'fulfilled');
  const failures = results.filter(r => r.status === 'rejected');

  console.log(`Successes: ${successes.length}, Failures: ${failures.length}`);
  return successes.length === 1;
}
