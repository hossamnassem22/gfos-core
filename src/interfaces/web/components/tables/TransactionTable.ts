import { Transaction } from "../../../../shared/types/transaction.ts";

export const TransactionTable = (transactions: Transaction[]) => `
  <div class="bg-white rounded-2xl border border-slate-200 shadow-sm mt-8 overflow-hidden">
    <div class="p-6 border-b border-slate-100">
      <h2 class="font-bold text-lg">سجل العمليات الأخيرة</h2>
    </div>
    <table class="w-full text-right">
      <thead class="bg-slate-50 text-slate-500 text-sm">
        <tr>
          <th class="p-4">العميل</th>
          <th class="p-4">النوع</th>
          <th class="p-4">الحالة</th>
          <th class="p-4">التاريخ</th>
        </tr>
      </thead>
      <tbody>
        ${transactions.map(t => `
          <tr class="border-t border-slate-100 hover:bg-slate-50 transition">
            <td class="p-4 font-bold">${t.client}</td>
            <td class="p-4">${t.type}</td>
            <td class="p-4"><span class="px-3 py-1 rounded-full text-xs font-bold ${t.status === 'مكتمل' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}">${t.status}</span></td>
            <td class="p-4 text-slate-400">${t.date}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
`;
