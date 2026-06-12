import { Request, Response } from "npm:express";
import { AgreementService } from "@core/services/AgreementService.ts";
import { PaymentGatewayService } from "@core/services/PaymentGatewayService.ts";

const agreementService = new AgreementService();
const paymentService = new PaymentGatewayService();

export class AgreementController {
  static async settleDebt(req: Request, res: Response) {
    const { agreementId, amount } = req.body;
    
    // 1. إجراء التحويل المالي عبر البوابة
    const payment = await paymentService.processPayment(agreementId, amount);
    
    if (payment.success) {
      // 2. توثيق العملية في سجلنا (Ledger)
      await agreementService.recordPayment(agreementId, payment.amount, payment.transactionId);
      
      res.status(200).json({ message: "تم سداد القسط وتوثيقه بنجاح", txId: payment.transactionId });
    } else {
      res.status(400).json({ error: "فشلت عملية الدفع" });
    }
  }
}
