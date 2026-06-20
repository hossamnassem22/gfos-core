export const HelpCenter = () => (
  <div className="p-6 bg-slate-50 border-l-4 border-blue-500">
    <h2 className="text-xl font-bold">مركز مساعدة المستخدم</h2>
    <div className="mt-4">
      <details className="mb-2">
        <summary className="font-semibold cursor-pointer">كيف أسترد أموالي من الضمان المالي؟</summary>
        <p className="p-2 text-sm">يتم استرداد الأموال آلياً بمجرد إثبات عدم مطابقة المواصفات عبر الموديل اللوجستي.</p>
      </details>
      <details>
        <summary className="font-semibold cursor-pointer">كيف أقوم بدمج شحنتي مع آخرين؟</summary>
        <p className="p-2 text-sm">توجه إلى "مركز اللوجستيات" واضغط على زر "دمج الشحنات المتاحة".</p>
      </details>
    </div>
  </div>
);
