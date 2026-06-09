import postgres from "npm:postgres";

const sql = postgres({
  host:     "localhost",
  port:     5432,
  database: "selfni_core",
  username: Deno.env.get("USER") ?? "u0_a202",
});

export { sql };
