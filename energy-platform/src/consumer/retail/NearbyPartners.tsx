export const NearbyPartners = ({ partners }) => (
  <div className="mt-6">
    <h2 className="font-bold mb-4">متاجر تستبدل نقاطك بها:</h2>
    <div className="grid grid-cols-2 gap-4">
      {partners.map(p => (
        <div key={p.id} className="p-4 border rounded shadow-sm">
          <h4>{p.name}</h4>
          <p className="text-xs text-green-600">خصم {p.discount}%</p>
        </div>
      ))}
    </div>
  </div>
);
