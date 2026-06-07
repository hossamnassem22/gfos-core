import { db } from "../../infrastructure/db/connection.ts";

export class IdempotencyGate {
  async execute<T>(key: string, action: () => Promise<T>): Promise<T> {
    return await db.transaction(async (tx: any) => {
      return await action();
    });
  }
}
