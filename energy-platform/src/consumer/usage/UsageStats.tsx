export const UsageStats = ({ dailyUsage, cost }) => (
  <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
    <h2 className="text-xl font-bold">استهلاكي الحالي</h2>
    <div className="mt-4 text-3xl font-mono text-blue-600">{dailyUsage} kWh</div>
    <p className="text-gray-500 mt-2">التكلفة التقديرية: {cost} جنيه</p>
  </div>
);
