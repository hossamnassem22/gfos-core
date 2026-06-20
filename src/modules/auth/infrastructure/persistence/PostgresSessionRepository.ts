import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import { SessionRepositoryPort } from "../../domain/ports/SessionRepositoryPort.ts";
import { Session } from "../../domain/models/Session.ts";

export class PostgresSessionRepository implements SessionRepositoryPort {
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

  async find(refreshToken: string): Promise<Session | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.queryObject<Session>(
        "SELECT * FROM sessions WHERE refresh_token = $1",
        [refreshToken]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async revoke(refreshToken: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.queryObject("DELETE FROM sessions WHERE refresh_token = $1", [refreshToken]);
    } finally {
      client.release();
    }
  }
}
