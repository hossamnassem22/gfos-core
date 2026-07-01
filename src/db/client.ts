import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const DATABASE_URL = Deno.env.get("DATABASE_URL") ?? "";

// Lazily create pool only if DATABASE_URL is provided to avoid throwing at import time
let pool: Pool | null = null;
if (DATABASE_URL) {
  pool = new Pool(DATABASE_URL, 3, true);
}

export async function queryObject(text: string, params: Array<unknown> = []): Promise<any> {
  if (!pool) {
    throw new Error(
      "DATABASE_URL is not configured. Set the DATABASE_URL environment variable or Actions secret to run DB operations."
    );
  }
  const client = await pool.connect();
  try {
    return await client.queryObject({ text, args: params });
  } finally {
    client.release();
  }
}
