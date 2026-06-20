export const OutageMap = ({ incidents }) => (
  <div className="p-6 bg-slate-900 border border-red-900 rounded-xl">
    <h2 className="text-red-400 font-bold">خريطة الأعطال اللحظية</h2>
    <ul>
      {incidents.map(inc => (
        <li key={inc.id} className="text-white mt-2">
          العطل في المنطقة {inc.zone} - الحالة: {inc.status}
        </li>
      ))}
    </ul>
  </div>
);
