import { TOKENS } from "../../tokens/tokens.ts";

interface AlertProps {
  type: 'warning' | 'danger' | 'info';
  message: string;
}

export const AlertBox = ({ type, message }: AlertProps) => {
  const color = type === 'danger' ? TOKENS.colors.status.danger : 
                type === 'warning' ? TOKENS.colors.status.warning : 
                TOKENS.colors.primary;
                
  return `
    <div class="flex items-center gap-[${TOKENS.spacing.sm}] p-[${TOKENS.spacing.md}] rounded-[${TOKENS.borderRadius.md}] border-l-4 border-[${color}] bg-slate-50 mb-[${TOKENS.spacing.sm}]">
      <span class="text-[${color}] font-bold">⚠</span>
      <p class="text-sm text-[${TOKENS.colors.text.primary}]">${message}</p>
    </div>
  `;
};
