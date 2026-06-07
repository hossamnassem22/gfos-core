import { Money } from "./domain/ledger/Money.ts";
import { SettlementEngine } from "./application/services/SettlementEngine.ts";
import { TransactionEngine } from "./application/services/TransactionEngine.ts";
import { DebtRepaymentRule } from "./application/rules/PostingRules.ts";

// 1. الدفعة (1000 جنيه)
const payment = new Money(100000n, "EGP");

// 2. المطالبات (السياسات)
const claims = [
  { claimantId: "FACTORY_01", priority: 1, rule: { type: 'FIXED_PERCENTAGE', value: 30 } },
  { claimantId: "DEALER_01", priority: 2, rule: { type: 'REMAINING_BALANCE' } }
];

// 3. التنفيذ
const plan = SettlementEngine.processWaterfall(payment, claims);
const txEngine = new TransactionEngine(new Map([['DEBT_REPAYMENT', new DebtRepaymentRule()]]));

console.log("--- بدء معالجة الشلال المالي ---");
// هنا يتم الربط الكامل للنواة
