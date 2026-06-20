export const ComplianceCalendar = ({ events }) => (
  <div className="bg-slate-950 p-6 rounded shadow-lg border border-slate-700">
    <h2 className="text-yellow-500">أجندة الالتزامات</h2>
    <ul className="mt-4 text-slate-300">
      {events.map(ev => (
        <li key={ev.id} className="mb-2">
          {ev.date}: {ev.description} {ev.isUrgent ? '⚠️' : ''}
        </li>
      ))}
    </ul>
  </div>
);
