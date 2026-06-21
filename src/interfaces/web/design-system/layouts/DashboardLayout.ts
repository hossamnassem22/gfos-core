import { TOKENS } from "../tokens/tokens.ts";

export const DashboardLayout = (content: string, sidebar: string) => `
  <div class="flex min-h-screen bg-[${TOKENS.colors.background}]">
    <!-- Sidebar -->
    <aside class="w-64 border-r border-[${TOKENS.colors.border}]">
      ${sidebar}
    </aside>
    
    <!-- Main Content -->
    <main class="flex-1 p-[${TOKENS.spacing.lg}]">
      <div class="max-w-7xl mx-auto grid grid-cols-12 gap-[${TOKENS.grid.gap}]">
        ${content}
      </div>
    </main>
  </div>
`;
