export const AdminPanel = ({ orders }: { orders: any[] }) => (
  <div className="p-6 bg-yellow-50 rounded-xl">
    <h2 className="text-xl font-bold mb-4 text-yellow-800">سجل الإدارة</h2>
    <div className="text-2xl font-black">{orders.length * 5} جنيه</div>
    <p className="text-sm text-yellow-700">إجمالي رسوم الربط المحصلة</p>
  </div>
);
