export const getLedgerData = async () => {
  // هذه الدالة تمثل الآن "المصدر الوحيد للحقيقة"
  // في بيئة الإنتاج يتم استبدال البيانات هنا باستعلام SQL فعلي
  return [
    {
      id: "d57ed3e8-8e27-4a1f-b108-92341c5bfe9f",
      tenant_id: "1",
      reference: "PMT-8cd0dbb8-3d0a-42d1-867a-b94035ab9126",
      description: "Payment Received",
      created_at: "2026-06-19T05:22:36.468Z",
      is_reversed: false
    },
    {
      id: "efe58a6e-b4b5-4d00-af7a-a29c8feae11f",
      tenant_id: "1",
      reference: "DEBT-7279aa02-3b2a-4185-92ed-dd4f58b71035",
      description: "Debt Agreement Created",
      created_at: "2026-06-19T05:11:03.782Z",
      is_reversed: false
    }
  ];
};
