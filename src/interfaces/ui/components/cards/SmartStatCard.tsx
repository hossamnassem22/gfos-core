export const SmartStatCard = ({ title, value, status, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg hover:border-blue-500 cursor-pointer transform hover:scale-105 transition-all"
  >
    <p className="text-slate-400 text-sm font-medium">{title}</p>
    <h3 className="text-2xl font-bold text-white mt-2">{value}</h3>
    {status && <span className="text-xs text-red-400 font-bold">{status}</span>}
  </div>
);
