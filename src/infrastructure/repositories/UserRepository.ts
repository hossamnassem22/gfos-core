import { pool } from "../database/connection.ts";

export type UserRow = {
  id: number;
  email: string;
  password_hash: string;
  role: string;
};

export class UserRepository {
  async findByEmail(email: string): Promise<UserRow | null> {
    const client = await pool.connect();

    try {
      const result = await client.queryObject<UserRow>(
        "SELECT id, email, password_hash, role FROM users WHERE email=$1 LIMIT 1",
        [email]
      );

      return result.rows[0] ?? null;
    } finally {
      client.release();
    }
  }
}
