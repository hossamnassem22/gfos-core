import { AccountRepository } from "./accounting/AccountRepository.ts";
import { JournalRepository } from "./accounting/JournalRepository.ts";
import { JournalEntry } from "./accounting/JournalEntry.ts";
import { AccountBalanceService } from "./accounting/AccountBalanceService.ts";
import { TrialBalanceService } from "./accounting/TrialBalanceService.ts";
import { seedAccounts } from "./accounting/seed.ts";

const accountRepo = new AccountRepository();
seedAccounts(accountRepo);
const journalRepo = new JournalRepository(accountRepo);
const balanceService = new AccountBalanceService(journalRepo, accountRepo);
const trialBalanceService = new TrialBalanceService(accountRepo, balanceService);

async function runFullTest() {
  console.log("--- Starting Full Ledger & Balance Test ---");

  // 1. إجراء عملية مالية
  const entry = JournalEntry.create({
    referenceId: 'ref-1',
    referenceType: 'TEST',
    description: 'Debit Cash, Credit Income',
    lines: [
      { accountCode: 'CASH_ASSET', debit: 100000, credit: 0 },
      { accountCode: 'INTEREST_INCOME', debit: 0, credit: 100000 }
    ]
  });
  await journalRepo.save(entry);

  // 2. التحقق من رصيد الحسابات
  const cashBalance = await balanceService.getBalance('CASH_ASSET');
  console.log("CASH_ASSET Balance:", cashBalance);

  const incomeBalance = await balanceService.getBalance('INTEREST_INCOME');
  console.log("INTEREST_INCOME Balance:", incomeBalance);
  
  if (cashBalance.balance === 100000 && incomeBalance.balance === 100000) {
      console.log("--- Success: Balances are correct ---");
  } else {
      console.error("--- Error: Balance calculation failed ---");
  }

  // 3. اختبار ميزان المراجعة
  const tb = await trialBalanceService.generate();
  console.log("--- Trial Balance ---");
  console.log(JSON.stringify(tb, null, 2));
}

runFullTest();
