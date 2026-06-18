import { FastifyInstance } from "npm:fastify";
import { sql } from "../../../infrastructu../../infrastructure/database/connection.ts";
import { requireAuth } from "../middleware/auth.ts";
import { NotificationEngine } from "@app/services/NotificationEngine.ts";

export async function notificationRoutes(app: FastifyInstance) {

  // جلب كل الإشعارات
  app.get("/notifications", { preHandler: requireAuth }, async (req) => {
    const { userId } = (req as any).user;
    const rows = await sql`
      SELECT * FROM notifications
      WHERE tenant_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 50
    `;
    return rows;
  });

  // عدد الإشعارات غير المقروءة
  app.get("/notifications/unread-count", { preHandler: requireAuth }, async (req) => {
    const { userId } = (req as any).user;
    const rows = await sql`
      SELECT COUNT(*) AS count FROM notifications
      WHERE tenant_id = ${userId} AND is_read = false
    `;
    return { count: Number(rows[0].count) };
  });

  // تعليم كإشعار مقروء
  app.patch("/notifications/:id/read", { preHandler: requireAuth }, async (req) => {
    const { userId } = (req as any).user;
    const { id } = req.params as any;
    await sql`
      UPDATE notifications SET is_read = true
      WHERE id = ${id} AND tenant_id = ${userId}
    `;
    return { ok: true };
  });

  // تعليم الكل كمقروء
  app.patch("/notifications/read-all", { preHandler: requireAuth }, async (req) => {
    const { userId } = (req as any).user;
    await sql`
      UPDATE notifications SET is_read = true
      WHERE tenant_id = ${userId} AND is_read = false
    `;
    return { ok: true };
  });

  // تشغيل يدوي
  app.post("/notifications/run", { preHandler: requireAuth }, async () => {
    const result = await NotificationEngine.process();
    return result;
  });
}
