const { JournalEntry } = require('./src/domain/ledger/journal-entry');
const { EntryType } = require('./src/domain/ledger/ledger-line');

try {
  // 1. اختبار القيد المتوازن
  new JournalEntry('id-1', [
    { accountId: '1', amount: 100n, type: EntryType.DEBIT },
    { accountId: '2', amount: 100n, type: EntryType.CREDIT }
  ]);
  console.log('✅ Test 1: Balanced entry passed!');

  // 2. اختبار القيد غير المتوازن
  new JournalEntry('id-2', [
    { accountId: '1', amount: 100n, type: EntryType.DEBIT },
    { accountId: '2', amount: 50n, type: EntryType.CREDIT }
  ]);
  console.log('❌ Test 2: Failed! (This should not be reached)');
} catch (e) {
  console.log('✅ Test 2: Caught expected error ->', e.message);
}
