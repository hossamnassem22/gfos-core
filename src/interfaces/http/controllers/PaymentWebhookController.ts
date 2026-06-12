import { Request, Response } from "npm:express";
import { AgreementService } from "../../core/services/AgreementService.ts";
import { GatewayRegistry } from "../../core/gateways/GatewayRegistry.ts";

const agreementService = new AgreementService();

export class PaymentWebhookController {
  static async handle(req: Request, res: Response) {
    const { agreementId, amountCents, txId, provider } = req.body;
    
    // 1. استدعاء البوابة المطلوبة ديناميكياً
    const gateway = GatewayRegistry.getGateway(provider);
    if (!gateway) return res.status(400).json({ error: "بوابة دفع غير مدعومة" });

    // 2. التحقق من صحة المعاملة عبر البوابة المختارة
    const isValid = await gateway.verifyTransaction(txId);
    
    if (isValid) {
      // 3. توثيق المعاملة في سجل GFOS الموحد
      await agreementService.recordVerifiedPayment(agreementId, amountCents, provider, txId);
      res.status(200).send("OK");
    } else {
      res.status(402).json({ error: "المعاملة غير صالحة" });
    }
  }
}
