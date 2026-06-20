import { UserRepositoryPort } from "../../application/boundary/ports.ts";
import { db } from "../database/connection.ts";

export class UserRepositoryAdapter implements UserRepositoryPort {
  async findById(id: string) {
    return await db.query("SELECT * FROM users WHERE id = ?", [id]);
  }
}
