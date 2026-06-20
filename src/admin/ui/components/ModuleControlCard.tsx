export const ModuleControlCard = ({ name, status, onAction }) => (
  <div className="bg-slate-900 border border-blue-900 p-6 rounded-2xl shadow-2xl">
    <h2 className="text-xl font-bold text-blue-400">{name}</h2>
    <div className="flex gap-2 mt-4">
      <button onClick={() => onAction('START')} className="px-4 py-2 bg-green-900 text-green-200 rounded">RUN</button>
      <button onClick={() => onAction('MAINTENANCE')} className="px-4 py-2 bg-yellow-900 text-yellow-200 rounded">FIX</button>
      <button onClick={() => onAction('HALT')} className="px-4 py-2 bg-red-900 text-red-200 rounded">STOP</button>
    </div>
    <p className="mt-4 text-slate-500 text-xs uppercase">Current Phase: {status}</p>
  </div>
);
