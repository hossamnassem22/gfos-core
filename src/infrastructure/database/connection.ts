import postgres from "npm:postgres";

const user = Deno.env.get("USER") ?? "u0_a202";
const DB_URL = Deno.env.get("DATABASE_URL") ??
  `postgres://${user}@localhost/selfni_core`;

export const sql = postgres(DB_URL, {
  max: 10,
  idle_timeout: 30,
  connect_timeout: 10,
});

export async function runMigrations(): Promise<void> {
  const schema = await Deno.readTextFile(
    new URL("./schema.sql", import.meta.url).pathname
  );
  await sql.unsafe(schema);
  console.log("Migrations applied successfully.");
}
