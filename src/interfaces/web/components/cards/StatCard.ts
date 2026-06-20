import { DashboardStat } from "../../../../shared/types/dashboard.ts";
import { STAT_COLORS } from "../../themes/colors.ts";

export const StatCard = (props: DashboardStat) => `
  <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <p class="text-slate-500 text-sm font-medium">${props.title}</p>
    <h3 class="text-2xl font-black mt-2 ${STAT_COLORS[props.color]}">${props.value}</h3>
  </div>
`;
