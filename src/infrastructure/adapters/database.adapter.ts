import { DatabasePort } from "../../application/boundary/ports.ts";
import { db } from "../database/connection.ts";

export class DatabaseAdapter implements DatabasePort {
  async query(sql: string, params?: any[]) {
    return await db.query(sql, params);
  }
}
