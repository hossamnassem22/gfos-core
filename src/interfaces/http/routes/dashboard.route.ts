import { getDashboardPage } from "../../web/controllers/DashboardController.ts";

export const dashboardRoute = async (req: any) => {
  const html = await getDashboardPage(req);
  return new Response(html, {
    headers: { "content-type": "text/html" },
  });
};
