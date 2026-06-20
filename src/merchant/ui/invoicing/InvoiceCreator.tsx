export const InvoiceCreator = ({ onGenerate }) => (
  <div className="bg-slate-900 p-6 rounded-2xl border border-emerald-900">
    <h2 className="text-emerald-400 font-bold">إصدار فاتورة جديدة</h2>
    <input className="w-full bg-slate-800 p-2 mt-2 rounded" placeholder="المبلغ" />
    <button onClick={onGenerate} className="w-full mt-4 bg-emerald-600 p-2 rounded text-white">إصدار</button>
  </div>
);
