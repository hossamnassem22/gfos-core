export const LogisticsDashboard = ({ data }) => (
  <div className="p-6 bg-slate-900 border border-slate-700 rounded-xl">
    <h2 className="text-blue-400">تحليل الأداء اللوجستي</h2>
    <div className="mt-4 text-slate-300">
      <p>متوسط زمن الشحن: {data.avgTime} ساعة</p>
      <p>معدل التسليم الناجح: {data.successRate}%</p>
    </div>
  </div>
);
