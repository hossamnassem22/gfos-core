import jwt from "npm:jsonwebtoken";
import bcrypt from "npm:bcryptjs";
import { sql } from "../../infrastructure/database/connection.ts";

const JWT_SECRET = Deno.env.get("JWT_SECRET") ?? "selfni-dev-secret-change-in-prod";
const JWT_EXPIRES = "24h";

export interface TokenPayload {
  userId: string;
  username: string;
}

export class AuthService {
  async register(username: string, email: string, password: string): Promise<string> {
    const hash = await bcrypt.hash(password, 12);
    const rows = await sql`
      INSERT INTO users (username, email, password_hash)
      VALUES (${username}, ${email}, ${hash})
      RETURNING id, username
    `;
    return this.signToken({ userId: rows[0].id, username: rows[0].username });
  }

  async login(email: string, password: string): Promise<string> {
    const rows = await sql`
      SELECT id, username, password_hash FROM users WHERE email = ${email}
    `;
    if (rows.length === 0) throw new Error("بيانات غير صحيحة");

    const valid = await bcrypt.compare(password, rows[0].password_hash);
    if (!valid) throw new Error("بيانات غير صحيحة");

    return this.signToken({ userId: rows[0].id, username: rows[0].username });
  }

  verifyToken(token: string): TokenPayload {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  }

  private signToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  }
}
