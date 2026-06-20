export const FactoryDashboard = ({ orders }: { orders: any[] }) => (
  <div className="p-6 border rounded-xl">
    <h2 className="text-xl font-bold mb-4">الطلبات الواردة</h2>
    {orders.length === 0 ? <p className="text-gray-400">لا توجد طلبات</p> : (
      orders.map(o => <div key={o.id} className="p-3 border-b">{o.product} - {o.quantity} قطعة</div>)
    )}
  </div>
);
