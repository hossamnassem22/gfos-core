import { JournalEntry, JournalLine } from '../src/domain/ledger/JournalEntry';
import { Money } from '../src/domain/ledger/Money';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error("❌ اختبار فاشل: " + message);
    process.exit(1);
  } else {
    console.log("✅ اختبار ناجح: " + message);
  }
}

const entryFail = new JournalEntry('TXN-001', 'TENANT-A');
entryFail.addLine(new JournalLine('ACC-1', Money.from(100), Money.from(0)));
entryFail.addLine(new JournalLine('ACC-2', Money.from(0), Money.from(50)));
assert(entryFail.validateBalance() === false, "تم منع القيد غير المتوازن بنجاح");

const entryPass = new JournalEntry('TXN-002', 'TENANT-A');
entryPass.addLine(new JournalLine('ACC-1', Money.from(100), Money.from(0)));
entryPass.addLine(new JournalLine('ACC-2', Money.from(0), Money.from(100)));
assert(entryPass.validateBalance() === true, "تم قبول القيد المتوازن بنجاح");
