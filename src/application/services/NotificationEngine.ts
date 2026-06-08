import { sql } from "@infra/database/connection.ts";
import { EmailSender } from "@infra/mail/EmailSender.ts";

export class NotificationEngine {
  static async process() {
    const results = { created: 0, skipped: 0 };
    
    // جلب الأقساط المستحقة (نفس المنطق السابق مع إضافة جلب البريد)
    const upcoming = await sql`
      SELECT s.*, d.user_id as tenant_id, c.email 
      FROM amortization_schedule s
      JOIN debt_agreements d ON d.id = s.debt_id
      LEFT JOIN customers c ON c.id = d.customer_id
      WHERE s.status = 'PENDING' AND s.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'
    `;

    for (const row of upcoming) {
      // التخزين في الداتابيس
      await sql`
        INSERT INTO notifications (tenant_id, customer_id, debt_id, type, title, body)
        VALUES (${row.tenant_id}, ${row.customer_id}, ${row.debt_id}, 'UPCOMING_INSTALLMENT', 'قسط مستحق', ${row.body})
      `;
      
      // الإرسال الخارجي
      if (row.email) {
        await EmailSender.send(row.email, 'تذكير بالدفع', row.body);
      }
      results.created++;
    }
    return results;
  }
}
