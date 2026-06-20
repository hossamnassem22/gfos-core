import { sql } from "../../infrastructure/database/connection.ts";

export class LedgerPostingService {
  async getLedger(_req: any, _rep: any) {
    const rows = await sql`SELECT * FROM journal_entries ORDER BY created_at DESC LIMIT 50`;
    return rows;
  }

  async postEntry(req: any, _rep: any) {
    const { tenantId, reference, description, currency, lines } = req.body;
    const result = await sql`
      INSERT INTO journal_entries (tenant_id, reference, description, currency, lines)
      VALUES (${tenantId}, ${reference}, ${description}, ${currency}, ${JSON.stringify(lines)}::jsonb)
      RETURNING *
    `;
    return result[0];
  }
}
