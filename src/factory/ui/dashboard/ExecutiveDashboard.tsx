export const ExecutiveDashboard = ({ data }) => (
  <div className="grid grid-cols-2 gap-4">
    <div className="p-6 bg-slate-900 border border-slate-700">
      <h3>إجمالي الإنتاج: {data.totalOutput}</h3>
    </div>
    <div className="p-6 bg-slate-900 border border-slate-700">
      <h3>البصمة الكربونية: {data.emissions}</h3>
    </div>
  </div>
);
