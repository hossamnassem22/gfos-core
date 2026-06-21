import type { FastifyInstance } from "npm:fastify";
import { sql } from "../../../infrastructure/db/connection.ts";

export async function notificationRoutes(app: FastifyInstance) {

  app.get("/notifications", async (req: any) => {
    const tenantId = req.user?.userId?.toString() ?? "1";
    return sql`SELECT * FROM notifications WHERE tenant_id = ${tenantId} ORDER BY created_at DESC LIMIT 50`;
  });

  app.get("/notifications/unread-count", async (req: any) => {
    const tenantId = req.user?.userId?.toString() ?? "1";
    const [r] = await sql`SELECT COUNT(*) AS c FROM notifications WHERE tenant_id = ${tenantId} AND is_read = false`;
    return { count: Number(r.c) };
  });

  app.patch("/notifications/:id/read", async (req: any) => {
    const tenantId = req.user?.userId?.toString() ?? "1";
    await sql`UPDATE notifications SET is_read = true WHERE id = ${req.params.id} AND tenant_id = ${tenantId}`;
    return { ok: true };
  });

  app.patch("/notifications/read-all", async (req: any) => {
    const tenantId = req.user?.userId?.toString() ?? "1";
    await sql`UPDATE notifications SET is_read = true WHERE tenant_id = ${tenantId}`;
    return { ok: true };
  });
}
