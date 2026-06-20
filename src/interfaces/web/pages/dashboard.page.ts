import { renderLayout } from "../layouts/dashboard.layout.ts";
import { StatCard } from "../components/StatCard.ts";

export const DashboardPage = (stats: any[]) => {
  const statsHtml = stats.map(s => StatCard(s)).join('');
  return renderLayout(`
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      ${statsHtml}
    </div>
  `);
};
