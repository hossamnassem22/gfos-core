export const ParamConfig = ({ paramName, value, onChange }) => (
  <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
    <label className="text-slate-400">{paramName}</label>
    <input 
      type="number" 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="ml-4 bg-slate-800 border border-slate-600 rounded p-1"
    />
  </div>
);
