import postgres from "npm:postgres";

const connectionString = Deno.env.get("DATABASE_URL") ?? 
  "postgres://u0_a202@localhost:5432/selfni_core";

export const sql = postgres(connectionString);

// للتوافق مع الكود القديم اللي بيستخدم pool.connect
export const pool = {
  connect: async () => {
    return {
      queryObject: async <T>(query: string, params: any[] = []) => {
        const rows = await sql.unsafe(query, params) as T[];
        return { rows };
      },
      query: async (query: string, params: any[] = []) => {
        const rows = await sql.unsafe(query, params);
        return { rows };
      },
      release: () => {},
    };
  }
};
