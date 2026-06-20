export const ShipmentGroup = ({ shipments }) => (
  <div className="p-6 bg-green-950 border border-green-700 rounded-lg">
    <h2 className="text-green-400">تجميع الشحنات (توفير التكاليف)</h2>
    <div className="mt-2 text-white">
      {shipments.map(s => <p key={s.id}>شحنة {s.id} - المنطقة {s.zone}</p>)}
    </div>
    <button className="mt-4 bg-green-600 w-full py-2 rounded">دمج في طلبية واحدة</button>
  </div>
);
