import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

export const db = new Client({
  database: "selfni_core",
  user: "user",           // غير لو مختلف
  password: "password",   // غير لو مختلف
  hostname: "localhost",
  port: 5432,
});

export async function connectDB() {
  try {
    await db.connect();
    console.log("✅ Connected to selfni_core database");
  } catch (e) {
    console.log("⚠️ DB connection failed:", e.message);
  }
}
