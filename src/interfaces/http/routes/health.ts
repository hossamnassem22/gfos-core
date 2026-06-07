import { FastifyInstance } from "npm:fastify";
import { sql } from "@infra/database/connection.ts";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async () => {
    try {
      // اختبار اتصال قاعدة البيانات
      await sql`SELECT 1`;
      return { 
        status: "OPERATIONAL", 
        timestamp: new Date().toISOString(),
        database: "CONNECTED" 
      };
    } catch (e) {
      return { status: "CRITICAL_ERROR", database: "DISCONNECTED" };
    }
  });
}
