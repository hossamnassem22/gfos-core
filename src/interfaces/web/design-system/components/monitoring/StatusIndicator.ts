import { TOKENS } from "../../tokens/tokens.ts";

interface StatusProps {
  label: string;
  status: 'online' | 'offline' | 'warning';
}

export const StatusIndicator = ({ label, status }: StatusProps) => {
  const color = status === 'online' ? TOKENS.colors.status.success : 
                status === 'offline' ? TOKENS.colors.status.danger : 
                TOKENS.colors.status.warning;
                
  return `
    <div class="flex items-center gap-[${TOKENS.spacing.sm}]">
      <div class="w-3 h-3 rounded-full bg-[${color}] animate-pulse"></div>
      <span class="text-xs font-bold text-[${TOKENS.colors.text.secondary}] uppercase">${label}</span>
    </div>
  `;
};
