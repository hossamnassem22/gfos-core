export const MarketFeed = ({ deals }) => (
  <div className="space-y-4">
    {deals.map(deal => (
      <div key={deal.id} className="p-4 border border-blue-600 rounded bg-slate-900">
        <h3 className="text-blue-400 font-bold">{deal.title}</h3>
        <p>السعر: {deal.price} | الكمية: {deal.quantity}</p>
        <button className="bg-blue-600 px-4 py-2 mt-2 rounded">طلب فوري</button>
      </div>
    ))}
  </div>
);
