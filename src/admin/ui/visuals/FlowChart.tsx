export const FlowChart = ({ phases }) => (
  <div className="flex justify-between items-center bg-slate-800 p-6 rounded-xl border border-blue-900">
    {phases.map((p, index) => (
      <div key={p} className="flex items-center">
        <div className={`w-4 h-4 rounded-full ${p.active ? 'bg-blue-500' : 'bg-slate-600'}`} />
        <span className="ml-2 text-slate-300">{p.label}</span>
        {index < phases.length - 1 && <div className="h-0.5 w-16 bg-slate-700 mx-4" />}
      </div>
    ))}
  </div>
);
