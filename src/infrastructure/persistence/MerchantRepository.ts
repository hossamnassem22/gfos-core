import { sql } from "@infra/database/connection.ts";

export interface Merchant {
  id?: string;
  name: string;
  phone: string;
  status?: string;
  plan?: string;
}

export class MerchantRepository {
  async create(merchant: Merchant): Promise<string> {
    const [row] = await sql`
      INSERT INTO merchants (name, phone, status, plan)
      VALUES (${merchant.name}, ${merchant.phone}, ${merchant.status || 'PENDING'}, ${merchant.plan || 'FREE'})
      RETURNING id
    `;
    return row.id;
  }

  async findByPhone(phone: string): Promise<Merchant | null> {
    const [row] = await sql`SELECT * FROM merchants WHERE phone = ${phone}`;
    return row ? { id: row.id, name: row.name, phone: row.phone, status: row.status, plan: row.plan } : null;
  }
}
