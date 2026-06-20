export const StockManager = ({ material, currentStock, threshold }) => (
  <div className="bg-slate-900 border-l-4 border-yellow-500 p-4 rounded">
    <h3 className="text-white">المادة: {material}</h3>
    <p className={currentStock < threshold ? "text-red-500" : "text-green-500"}>
      الرصيد الحالي: {currentStock}
    </p>
  </div>
);
