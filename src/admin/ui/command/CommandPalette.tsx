export const CommandPalette = ({ onExecute }) => (
  <div className="p-4 bg-slate-900 border-t border-slate-800">
    <input 
      placeholder="Type command (e.g., 'halt:billing', 'backup:now')..."
      className="w-full bg-slate-800 p-2 rounded text-blue-400 border border-slate-700"
      onKeyDown={(e) => e.key === 'Enter' && onExecute(e.target.value)}
    />
  </div>
);
