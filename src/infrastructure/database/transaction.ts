import { pool } from "./connection.ts";

export async function withTransaction<T>(
  fn: (client: any) => Promise<T>
): Promise<T> {

  const client = await pool.connect();

  try {
    await client.queryObject("BEGIN");

    const result = await fn(client);

    await client.queryObject("COMMIT");

    return result;

  } catch (err) {
    await client.queryObject("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
