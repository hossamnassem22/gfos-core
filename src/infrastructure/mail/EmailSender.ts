import { createTransport } from "npm:nodemailer";

export class EmailSender {
  private static transporter = createTransport({
    host: Deno.env.get("SMTP_HOST") || "smtp.mailtrap.io",
    port: Number(Deno.env.get("SMTP_PORT")) || 2525,
    auth: {
      user: Deno.env.get("SMTP_USER"),
      pass: Deno.env.get("SMTP_PASS"),
    },
  });

  static async send(to: string, subject: string, text: string) {
    try {
      await this.transporter.sendMail({ 
        from: '"Selfni Core" <notify@selfni.com>', 
        to, 
        subject, 
        text 
      });
      return true;
    } catch (error) {
      console.error("Email failed:", error);
      return false;
    }
  }
}
