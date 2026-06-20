export const NotificationPanel = ({ alerts }) => (
  <div className="mt-6 space-y-2">
    {alerts.map(a => (
      <div key={a.id} className="p-3 bg-blue-50 text-blue-900 rounded border border-blue-100">
        <p className="text-sm font-medium">{a.message}</p>
      </div>
    ))}
  </div>
);
