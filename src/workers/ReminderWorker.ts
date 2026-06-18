import { sql } from "../../infrastructu../../infrastructure/database/connection.ts";

export async function runReminderWorker() {
  console.log("Running payment reminder worker...");
  
  // البحث عن الأقساط المستحقة خلال 3 أيام
  const upcoming = await sql`
    SELECT s.*, u.email, u.username 
    FROM amortization_schedule s
    JOIN debt_agreements d ON d.id = s.debt_id
    JOIN users u ON u.id = d.user_id
    WHERE s.status = 'PENDING'
    AND s.due_date <= CURRENT_DATE + INTERVAL '3 days'
    AND s.due_date >= CURRENT_DATE
  `;

  for (const installment of upcoming) {
    console.log(`Sending reminder to ${installment.email}: Payment due on ${installment.due_date}`);
    // هنا تضع كود إرسال الواتساب أو الإيميل
  }
}
