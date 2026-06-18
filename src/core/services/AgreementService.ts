import { sql } from "../../../infrastructure/database/connection.ts";

export class AgreementService {
  async recordVerifiedPayment(
    agreementId: string, 
    amountCents: number, 
    gatewayProvider: string, 
    gatewayTxId: string
  ) {
    return await sql`
      INSERT INTO ledger_entries (agreement_id, type, amount_cents, gateway_provider, gateway_tx_id)
      VALUES (${agreementId}, 'PAYMENT_RECEIVED', ${amountCents}, ${gatewayProvider}, ${gatewayTxId});
    `;
  }
}
