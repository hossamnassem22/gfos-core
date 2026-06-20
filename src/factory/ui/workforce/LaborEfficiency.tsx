export const LaborEfficiency = ({ shift, performance }) => (
  <div className="p-6 bg-slate-950 border border-slate-700 rounded-lg">
    <h2 className="text-blue-400">كفاءة الوردية: {shift}</h2>
    <div className="h-4 bg-slate-800 rounded mt-2">
      <div style={{ width: `${performance}%` }} className="h-full bg-blue-600 rounded" />
    </div>
  </div>
);
