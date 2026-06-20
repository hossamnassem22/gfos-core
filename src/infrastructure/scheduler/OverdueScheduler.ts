import { NotificationEngine } from "../../application/services/NotificationEngine.ts";
import { OverdueEngine } from "../../application/services/OverdueEngine.ts";
import { pool } from "../database/connection.ts";

export async function scheduleOverdueNotifications() {
  const client = await pool.connect();

  try {
    const r = await client.query(`
      SELECT id, customer_id, status
      FROM debt_agreements
      WHERE status = 'OVERDUE'
    `);

    for (const row of r.rows) {
      await NotificationEngine.notify({
        customerId: row.customer_id,
        debtId: row.id,
        type: "OVERDUE",
        title: "Overdue Payment",
        body: "A debt agreement is overdue",
      });

      await OverdueEngine.process(row.id);
    }

    if (r.rows.length > 0) {
      console.log(`📬 ${r.rows.length} overdue agreements processed`);
    }
  } catch (e) {
    console.error("scheduler error:", e);
  } finally {
    client.release();
  }
}
