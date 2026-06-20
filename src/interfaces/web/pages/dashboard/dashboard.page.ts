import { DashboardStat } from "../../../../shared/types/dashboard.ts";
import { Transaction } from "../../../../shared/types/transaction.ts";
import { StatCard } from "../../components/cards/StatCard.ts";
import { TransactionTable } from "../../components/tables/TransactionTable.ts";

export const DashboardPage = (stats: DashboardStat[], transactions: Transaction[]) => `
  <div class="space-y-8">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      ${stats.map(s => StatCard(s)).join('')}
    </div>
    ${TransactionTable(transactions)}
  </div>
`;
