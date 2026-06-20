export const SupplierPortal = ({ supplierName, performanceScore }) => (
  <div className="bg-slate-900 p-6 rounded-xl border border-blue-800">
    <h2 className="text-xl font-bold text-blue-400">شريك التوريد: {supplierName}</h2>
    <div className="mt-4">
      <p className="text-slate-400">درجة التزام المصنع: {performanceScore}/100</p>
    </div>
  </div>
);
