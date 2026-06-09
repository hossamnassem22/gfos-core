import { AccountRepository } from "./accounting/AccountRepository.ts";
import { JournalRepository } from "./accounting/JournalRepository.ts";
import { AccountBalanceService } from "./accounting/AccountBalanceService.ts";
import { TrialBalanceService } from "./accounting/TrialBalanceService.ts";
import { AccountingQueryService } from "./accounting/AccountingQueryService.ts";
import { LedgerFacade } from "./accounting/LedgerFacade.ts";
import { seedAccounts } from "./accounting/seed.ts";

async function main() {
  // 1. التجهيز (Wiring)
  const accountRepo = new AccountRepository();
  seedAccounts(accountRepo);
  const journalRepo = new JournalRepository(accountRepo);
  const balanceService = new AccountBalanceService(journalRepo, accountRepo);
  const trialService = new TrialBalanceService(accountRepo, balanceService);
  const queryService = new AccountingQueryService(journalRepo);

  const ledger = new LedgerFacade(accountRepo, journalRepo, balanceService, trialService, queryService);

  console.log("--- Starting LedgerFacade Acceptance Test ---");

  // 2. العمليات عبر الواجهة (Facade) فقط
  await ledger.postEntry({
    referenceId: "loan-1",
    referenceType: "LOAN",
    description: "Loan Disbursement",
    lines: [
      { accountCode: "CASH_ASSET", debit: 100000, credit: 0 },
      { accountCode: "CUSTOMER_DEPOSITS", debit: 0, credit: 100000 },
    ],
  });

  // 3. الاختبارات (Assertions)
  const cash = await ledger.getBalance("CASH_ASSET");
  console.log("CASH Balance via Facade:", cash.balance);

  const trial = await ledger.getTrialBalance();
  console.log("TRIAL Balanced:", trial.balanced);

  const statement = await ledger.getStatement("CASH_ASSET");
  console.log("STATEMENT entries count:", statement.statement.length);

  if (cash.balance === 100000 && trial.balanced === true) {
    console.log("✅ Financial Core Stabilization Complete: LedgerFacade verified.");
  } else {
    console.error("❌ Stabilization Failed.");
  }
}

main().catch(console.error);
