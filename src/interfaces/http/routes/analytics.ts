import { db } from "../../../application/boundary/container.ts";

export async function analyticsRoute(req: any, res: any) {
  const data = await db.query("SELECT * FROM analytics");

  return {
    success: true,
    data,
  };
}
