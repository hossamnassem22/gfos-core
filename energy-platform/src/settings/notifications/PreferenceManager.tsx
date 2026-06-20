export const PreferenceManager = () => (
  <div className="p-6">
    <h2 className="text-lg font-bold">تفضيلات التنبيهات</h2>
    <label className="flex items-center mt-4">
      <input type="checkbox" className="mr-2" /> تنبيهات مالية (SMS)
    </label>
    <label className="flex items-center mt-2">
      <input type="checkbox" className="mr-2" /> تحديثات اللوجستيات (تطبيق)
    </label>
  </div>
);
