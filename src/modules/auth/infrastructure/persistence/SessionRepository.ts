import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

export class SessionRepository {
  constructor(private pool: Pool) {}

  async create(userId: number, refreshToken: string, expiresAt: Date): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.queryObject(
        "INSERT INTO sessions (user_id, refresh_token, expires_at) VALUES ($1, $2, $3)",
        [userId, refreshToken, expiresAt]
      );
    } finally {
      client.release();
    }
  }
  // يمكنك إضافة find و revoke لاحقاً بنفس المنهجية
}
