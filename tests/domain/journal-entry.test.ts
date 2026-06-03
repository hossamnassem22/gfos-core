import { JournalEntry } from '../../src/domain/ledger/aggregates/JournalEntry';
import { JournalLine } from '../../src/domain/ledger/entities/JournalLine';
import { Money } from '../../src/domain/shared/Money';

function runTests() {
  console.log("--- بدء اختبارات سلامة النواة المالية ---");

  // 1. اختبار: منع القيد غير المتوازن
  try {
    const entry = new JournalEntry('J-001', 'TENANT-1');
    entry.addLine(new JournalLine('ACC-1', Money.from(100), Money.from(0)));
    entry.addLine(new JournalLine('ACC-2', Money.from(0), Money.from(50)));
    entry.validate();
    console.error("❌ فشل الاختبار: تم قبول قيد غير متوازن!");
  } catch (e: any) {
    console.log("✅ نجاح: تم منع القيد غير المتوازن (Expected Error: " + e.message + ")");
  }

  // 2. اختبار: قبول القيد المتوازن
  try {
    const entry = new JournalEntry('J-002', 'TENANT-1');
    entry.addLine(new JournalLine('ACC-1', Money.from(100), Money.from(0)));
    entry.addLine(new JournalLine('ACC-2', Money.from(0), Money.from(100)));
    entry.validate();
    console.log("✅ نجاح: تم قبول القيد المتوازن.");
  } catch (e) {
    console.error("❌ فشل الاختبار: تم رفض قيد متوازن!");
  }
}

runTests();
