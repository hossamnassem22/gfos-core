import { sql } from "../database/connection.ts";

export class WhatsAppService {
  async sendPaymentReminder(phoneNumber: string, message: string) {
    // منطق الاتصال بـ API الواتساب (مثلاً Twilio)
    console.log(`Sending WhatsApp to ${phoneNumber}: ${message}`);
    // هنا يتم استدعاء الـ HTTP Client الخاص بمزود الخدمة
    return { success: true };
  }

  async triggerUpcomingInstallments() {
    const upcoming = await sql`
      SELECT s.*, u.phone, u.username, d.id as debt_id
      FROM amortization_schedule s
      JOIN debt_agreements d ON d.id = s.debt_id
      JOIN users u ON u.id = d.user_id
      WHERE s.status = 'PENDING'
      AND s.due_date = CURRENT_DATE + INTERVAL '1 day'
    `;

    for (const item of upcoming) {
      await this.sendPaymentReminder(
        item.phone,
        `عزيزي ${item.username}، يرجى العلم أن قسط دينك رقم ${item.debt_id} مستحق غداً بقيمة ${item.total_payment_cents} قرشاً.`
      );
    }
  }
}
