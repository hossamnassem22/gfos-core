import { sql } from "../src/infrastructure/database/connection.ts";
import { OverdueEngine } from "../src/application/services/OverdueEngine.ts";

const uuid = () => crypto.randomUUID();

async function runUAT() {
  console.log("--- Starting End-to-End Financial UAT ---");

  const customerId = uuid();
  const debtId = uuid();
  const schId = uuid();
  const phone = '010' + Math.floor(Math.random() * 100000000);

  // 1. عميل
  await sql`INSERT INTO customers (id, name, phone) VALUES (${customerId}, 'Test Customer', ${phone})`;

  // 2. دين
  await sql`
    INSERT INTO debt_agreements (id, user_id, principal_cents, currency, annual_rate_bps, term_months, amort_type, status, customer_id)
    VALUES (${debtId}, 'user_01', 100000, 'EGP', 1000, 12, 'DECLINING', 'ACTIVE', ${customerId})
  `;

  // 3. قسط مع installment_number
  await sql`
    INSERT INTO amortization_schedule (id, debt_id, installment_number, due_date, principal_cents, interest_cents, total_payment_cents, remaining_balance_cents, status)
    VALUES (${schId}, ${debtId}, 1, CURRENT_DATE - INTERVAL '1 day', 8000, 2000, 10000, 90000, 'PENDING')
  `;

  console.log("✓ Setup done");

  // 4. OverdueEngine
  const result = await OverdueEngine.process({ dryRun: false });
  console.log("✓ OverdueEngine:", result);

  // 5. تحقق من الـ event
  const events = await sql`SELECT * FROM financial_events WHERE payload->>'installmentId' = ${schId}`;
  if (events.length > 0) console.log("✓ Financial Event recorded");
  else throw new Error("Financial Event not found!");

  console.log("✓ UAT Complete");
}

await runUAT().catch(err => { console.error("UAT Failed:", err); Deno.exit(1); });
