import { pool } from "../database/connection.ts";

export type User = {
  id: string;
  email: string;
  password_hash: string;
  role: string;
};

export class PostgresUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const client = await pool.connect();

    try {
      const result = await client.queryObject<User>(
        `SELECT id, email, password_hash, role
         FROM users
         WHERE email = $1
         LIMIT 1`,
        [email]
      );

      return result.rows.length ? result.rows[0] : null;
    } finally {
      client.release();
    }
  }
}
