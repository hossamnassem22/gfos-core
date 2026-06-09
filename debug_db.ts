import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

async function testConnection() {
  console.log("--- Starting Minimal DB Test ---");
  try {
    // تأكد من صحة بيانات الاتصال هنا (الاسم، كلمة المرور، قاعدة البيانات)
    const client = new Client("postgres://postgres:password@localhost:5432/gfos_db");
    await client.connect();
    console.log("✓ Connection successful!");
    
    const result = await client.queryObject`SELECT 1 as test`;
    console.log("✓ Query result:", result.rows[0]);
    
    await client.end();
  } catch (err) {
    console.error("✗ Connection failed:", err);
  }
}

await testConnection();
