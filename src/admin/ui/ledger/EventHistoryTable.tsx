export const EventHistoryTable = ({ events }) => (
  <table className="w-full bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
    <thead>
      <tr className="bg-slate-900 text-left text-slate-400">
        <th className="p-4">Timestamp</th>
        <th className="p-4">Module</th>
        <th className="p-4">Action</th>
        <th className="p-4">Admin ID</th>
      </tr>
    </thead>
    <tbody>
      {events.map(event => (
        <tr key={event.id} className="border-t border-slate-800 text-slate-200">
          <td className="p-4">{event.time}</td>
          <td className="p-4">{event.module}</td>
          <td className="p-4 font-mono">{event.action}</td>
          <td className="p-4">{event.admin}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
