import { runMigrations, sql } from "@infra/database/connection.ts";

// اختبار الكتابة والقراءة
async function testDB() {
  console.log("Testing PostgreSQL connection...");

  // إدخال سجل تجريبي
  await sql`
    INSERT INTO ledger_entries (user_id, account_id, amount_cents, currency, entry_type)
    VALUES ('USER-001', 'ACC-001', 50000, 'EGP', 'DEBIT')
  `;
  console.log("✓ INSERT successful");

  // قراءة السجل
  const rows = await sql`
    SELECT * FROM ledger_entries WHERE user_id = 'USER-001'
  `;
  console.log("✓ SELECT returned:", rows.length, "row(s)");
  console.log("  amount_cents:", rows[0].amount_cents);
  console.log("  currency:", rows[0].currency);
  console.log("  entry_type:", rows[0].entry_type);

  // اختبار الـ balance query
  const balance = await sql`
    SELECT
      COALESCE(SUM(CASE WHEN entry_type = 'DEBIT'  THEN amount_cents ELSE 0 END), 0) AS debits,
      COALESCE(SUM(CASE WHEN entry_type = 'CREDIT' THEN amount_cents ELSE 0 END), 0) AS credits
    FROM ledger_entries
    WHERE user_id = 'USER-001' AND account_id = 'ACC-001'
  `;
  console.log("✓ Balance query:");
  console.log("  debits:", balance[0].debits);
  console.log("  credits:", balance[0].credits);

  // تنظيف البيانات التجريبية
  await sql`DELETE FROM ledger_entries WHERE user_id = 'USER-001'`;
  console.log("✓ Cleanup done");

  await sql.end();
  console.log("\nPostgreSQL integration: OK");
}

testDB().catch(err => {
  console.error("DB test failed:", err.message);
  Deno.exit(1);
});
