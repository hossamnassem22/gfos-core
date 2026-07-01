import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const DATABASE_URL = Deno.env.get("DATABASE_URL");
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL env var is required for DB operations");
}

export const pool = new Pool(DATABASE_URL, 3, true);

export async function queryObject(text: string, params: Array<unknown> = []) {
  const client = await pool.connect();
  try {
    return await client.queryObject({ text, args: params });
  } finally {
    client.release();
  }
}
