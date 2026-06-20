import { SystemCore } from '../core/SystemCore';

export const RetailerInterface = () => {
  const handleOrder = () => {
    SystemCore.processNewOrder({
      id: `ORD-${Date.now()}`,
      retailerName: "تاجر محلي",
      factoryName: "مصنع شريك",
      product: "بضاعة",
      quantity: 1,
      status: 'PENDING'
    });
    alert('تم تسجيل الطلب ميدانياً');
  };

  return (
    <div className="p-6 border rounded-xl shadow-sm">
      <h2 className="text-xl font-bold mb-4">تسجيل طلب جديد</h2>
      <button onClick={handleOrder} className="w-full bg-blue-600 text-white p-4 rounded-lg font-bold">
        إرسال الطلب
      </button>
    </div>
  );
};
