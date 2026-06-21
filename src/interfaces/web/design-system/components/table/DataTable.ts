import { TOKENS } from "../../tokens/tokens.ts";

interface Column {
  header: string;
  accessor: string;
}

interface TableProps {
  columns: Column[];
  data: any[];
}

export const DataTable = ({ columns, data }: TableProps) => `
  <div class="overflow-x-auto">
    <table class="w-full border-collapse text-sm">
      <thead class="bg-slate-50 border-b border-[${TOKENS.colors.border}]">
        <tr>
          ${columns.map(col => `
            <th class="p-3 text-right font-bold text-[${TOKENS.colors.text.secondary}] uppercase">
              ${col.header}
            </th>
          `).join('')}
        </tr>
      </thead>
      <tbody>
        ${data.map(row => `
          <tr class="border-b border-[${TOKENS.colors.border}] hover:bg-slate-50/50">
            ${columns.map(col => `
              <td class="p-3 text-[${TOKENS.colors.text.primary}]">
                ${row[col.accessor]}
              </td>
            `).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
`;
