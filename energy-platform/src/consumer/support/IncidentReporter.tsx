export const IncidentReporter = () => (
  <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
    <h3 className="text-red-800 font-bold">إبلاغ عن عطل طارئ</h3>
    <textarea className="w-full mt-2 p-2 border rounded" placeholder="اشرح المشكلة..."></textarea>
    <button className="bg-red-600 text-white px-4 py-2 mt-2 rounded">إرسال البلاغ للشركة</button>
  </div>
);
