export const AuditHistory = ({ logs }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left text-sm text-slate-400">
      <thead><tr><th>الحدث</th><th>التاريخ</th><th>الحالة</th></tr></thead>
      <tbody>
        {logs.map(log => (
          <tr key={log.id}><td>{log.action}</td><td>{log.date}</td><td>{log.status}</td></tr>
        ))}
      </tbody>
    </table>
  </div>
);
