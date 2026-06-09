import { AccountRepository } from "./accounting/AccountRepository.ts";
import { JournalRepository } from "./accounting/JournalRepository.ts";
import { JournalEntry } from "./accounting/JournalEntry.ts";
import { AccountingQueryService } from "./accounting/AccountingQueryService.ts";
import { seedAccounts } from "./accounting/seed.ts";

const accountRepo = new AccountRepository();
seedAccounts(accountRepo);
const journalRepo = new JournalRepository(accountRepo);
const queryService = new AccountingQueryService(journalRepo);

async function runQueryTest() {
  console.log("--- Starting General Ledger Query Test ---");

  // إضافة حركتين على نفس الحساب لاختبار الرصيد المتراكم
  await journalRepo.save(JournalEntry.create({
    referenceId: 'TXN-001', referenceType: 'SALE', description: 'Initial Cash',
    lines: [{ accountCode: 'CASH_ASSET', debit: 1000, credit: 0 }, { accountCode: 'INTEREST_INCOME', debit: 0, credit: 1000 }]
  }));

  await journalRepo.save(JournalEntry.create({
    referenceId: 'TXN-002', referenceType: 'EXPENSE', description: 'Cash Out',
    lines: [{ accountCode: 'CASH_ASSET', debit: 0, credit: 200 }, { accountCode: 'INTEREST_INCOME', debit: 200, credit: 0 }]
  }));

  const statement = await queryService.getAccountStatement('CASH_ASSET');
  console.log(JSON.stringify(statement, null, 2));
}

runQueryTest();
