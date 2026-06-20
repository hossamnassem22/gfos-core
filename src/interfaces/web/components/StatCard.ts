export interface StatCardProps {
  title: string;
  value: string;
  color: 'blue' | 'green' | 'red' | 'purple';
}

const COLORS = {
  blue: "text-blue-600",
  green: "text-green-600",
  red: "text-red-600",
  purple: "text-purple-600"
};

export const StatCard = (props: StatCardProps) => `
  <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <p class="text-slate-500 text-sm font-medium">${props.title}</p>
    <h3 class="text-2xl font-black mt-2 ${COLORS[props.color] ?? COLORS.blue}">${props.value}</h3>
  </div>
`;
