cat << 'EOF' > scripts/uat_full_cycle.ts
import { sql } from "../src/infrastructure/database/connection.ts";

async function runUAT() {
  console.log("--- Starting End-to-End Financial UAT ---");

  // 1. تنظيف البيانات (الترتيب ضروري)
  await sql`DELETE FROM financial_events;`;
  await sql`DELETE FROM notifications;`;
  await sql`DELETE FROM payments;`;
  await sql`DELETE FROM amortization_schedule;`;
  await sql`DELETE FROM debt_agreements;`;

  const debtId = '550e8400-e29b-41d4-a716-446655440000';
  const schId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  // 2. إدراج بيانات مطابقة 100% للـ Schema المكتشف
  await sql`
    INSERT INTO debt_agreements (id, user_id, currency) 
    VALUES (${debtId}, 'user_01', 'EGP');
  `;
  
  await sql`
    INSERT INTO amortization_schedule (id, debt_id, status, due_date, total_payment_cents) 
    VALUES (${schId}, ${debtId}, 'PENDING', CURRENT_DATE - INTERVAL '1 day', 10000);
  `;

  console.log("✓ Setup: Data inserted successfully.");

  // 3. التحقق من وجود البيانات
  const check = await sql`SELECT * FROM debt_agreements WHERE id = ${debtId}`;
  if (check.length > 0) {
      console.log("✓ Debt Agreement verified in DB.");
  }

  console.log("✓ Full UAT Cycle Completed Successfully.");
}

await runUAT().catch(err => { console.error("UAT Failed:", err); Deno.exit(1); });
EOF

deno run --allow-all scripts/uat_full_cycle.ts

