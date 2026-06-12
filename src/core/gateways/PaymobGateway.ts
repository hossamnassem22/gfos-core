import { IGateway } from "./IGateway.ts";

export class PaymobGateway implements IGateway {
  name = "PAYMOB";
  async verifyTransaction(transactionId: string): Promise<boolean> {
    // هنا يتم ربط الـ API الخاص بـ Paymob للتحقق من txId
    return true; 
  }
}
