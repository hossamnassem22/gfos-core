import { getDashboardPage } from "../../web/controllers/DashboardController.ts";
// افتراض أننا بحاجة لجلب بيانات الـ Ledger من الموديل مباشرة أو الـ Service
import { getLedgerData } from "../../../application/services/ledgerService.ts"; 

export const handleRequest = async (req: Request) => {
  const url = new URL(req.url);
  
  // مسار البيانات (API)
  if (url.pathname === "/ledger") {
    const data = await getLedgerData(); // جلب البيانات من المصدر مباشرة
    return new Response(JSON.stringify(data), {
      headers: { "content-type": "application/json" },
    });
  }

  // مسار الواجهة (Dashboard)
  if (url.pathname === "/") {
    const html = await getDashboardPage(req);
    return new Response(html, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
  
  return new Response("Not Found", { status: 404 });
};
