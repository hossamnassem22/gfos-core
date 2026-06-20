import pg from "npm:pg";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: Deno.env.get("DATABASE_URL"),
  max: 10,
  idleTimeoutMillis: 30000,
});
