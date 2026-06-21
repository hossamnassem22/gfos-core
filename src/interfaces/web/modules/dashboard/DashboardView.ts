import { BaseCard } from "../../design-system/components/BaseCard.ts";
import { DataTable } from "../../design-system/components/table/DataTable.ts";
import { AlertBox } from "../../design-system/components/alerts/AlertBox.ts";
import { StatusIndicator } from "../../design-system/components/monitoring/StatusIndicator.ts";
import { TOKENS } from "../../design-system/tokens/tokens.ts";

export const DashboardView = (data: any) => `
  <div class="col-span-12 mt-[${TOKENS.spacing.md}]">
    ${BaseCard({ 
      title: "صحة النظام", 
      content: `
        <div class="flex gap-[${TOKENS.spacing.xl}]">
          ${StatusIndicator({ label: "API", status: data.health.api })}
          ${StatusIndicator({ label: "Database", status: data.health.db })}
          ${StatusIndicator({ label: "Queue", status: data.health.queue })}
          ${StatusIndicator({ label: "Workers", status: data.health.workers })}
        </div>
      `, 
      colSpan: 12 
    })}
  </div>
`;
