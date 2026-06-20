export const PerformanceDashboard = ({ companyData }) => (
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
    <div className="col-span-1 bg-slate-900 p-6 rounded-2xl border border-blue-900">
      <h3 className="text-slate-400">Total Revenue</h3>
      <p className="text-3xl font-bold text-white mt-2">{companyData.revenue}</p>
    </div>
    {/* إضافة بطاقات أداء إضافية للمؤسسة */}
  </div>
);
