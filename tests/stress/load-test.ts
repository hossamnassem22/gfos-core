import { LedgerPostingService } from '../../src/application/services/LedgerPostingService';

async function runStressTest() {
  const ledger = new LedgerPostingService();
  const iterations = 1000;
  console.log(`🚀 بدء محاكاة ${iterations} عملية ترحيل مالية...`);

  const tasks = Array.from({ length: iterations }).map((_, i) => 
    ledger.post({
      tenantId: 'TEST-TENANT',
      sourceId: `TXN-${i}`,
      lines: [
        { accountId: 'CASH', debit: 100n, credit: 0n },
        { accountId: 'REV', debit: 0n, credit: 100n }
      ]
    })
  );

  try {
    await Promise.all(tasks);
    console.log("✅ نجاح: النظام عالج كل العمليات بدون انهيار!");
  } catch (err) {
    console.error("🚨 كارثة: فشل النظام تحت الضغط!", err);
  }
}

runStressTest();
