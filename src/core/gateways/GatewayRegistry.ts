import { IGateway } from "./IGateway.ts";
import { PaymobGateway } from "./PaymobGateway.ts";

export class GatewayRegistry {
  private static gateways: Record<string, IGateway> = {
    PAYMOB: new PaymobGateway(),
    // يمكنك إضافة FAWRY, TAP, STRIPE هنا بسهولة
  };

  static getGateway(name: string): IGateway | undefined {
    return this.gateways[name.toUpperCase()];
  }
}
