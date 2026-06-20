export interface Transaction {
  id: string;
  client: string;
  type: string;
  status: "مكتمل" | "قيد التنفيذ" | "ملغي";
  date: string;
}
