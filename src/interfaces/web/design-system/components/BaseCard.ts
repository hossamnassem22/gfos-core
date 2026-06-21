import { TOKENS } from "../tokens/tokens.ts";

interface CardProps {
  title?: string;
  content: string;
  colSpan?: number; // ليتوافق مع نظام الـ 12 عمود
}

export const BaseCard = ({ title, content, colSpan = 3 }: CardProps) => `
  <div 
    class="bg-[${TOKENS.colors.surface}] rounded-[${TOKENS.borderRadius.lg}] border border-[${TOKENS.colors.border}] shadow-sm p-[${TOKENS.spacing.md}] col-span-${colSpan}"
  >
    ${title ? `
      <h3 class="text-xs font-bold text-[${TOKENS.colors.text.secondary}] uppercase tracking-wider mb-[${TOKENS.spacing.sm}]">
        ${title}
      </h3>
    ` : ""}
    <div class="text-[${TOKENS.colors.text.primary}]">
      ${content}
    </div>
  </div>
`;
