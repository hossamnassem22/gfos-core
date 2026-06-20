import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import { UserRepositoryPort } from "../../domain/ports/UserRepositoryPort.ts";
import { User } from "../../domain/models/User.ts";

export class PostgresUserRepository implements UserRepositoryPort {
  constructor(private pool: Pool) {}

  async findByEmail(email: string): Promise<User | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.queryObject<User>("SELECT * FROM users WHERE email = $1", [email]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async save(user: User): Promise<void> {
    // تنفيذ الحفظ
  }
}
