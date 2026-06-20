export const AdminDashboard = ({ adminId }) => (
  <div className="p-8 bg-black text-white">
    <h1>لوحة تحكم الأدمن المركزية</h1>
    <div className="grid grid-cols-2 gap-4 mt-6">
      <button onClick={() => {/* Toggle Factory Service */}}>تحكم في موديول المصنع</button>
      <button onClick={() => {/* Manage Permissions */}}>إدارة صلاحيات الوصول</button>
    </div>
  </div>
);
