// ════════════════════════════════════════════════════════════════════
// GFOS CORE — Banking-Grade Financial OS v2.0
// نقطة دخول واحدة — منطق موحد — لا عشوائية
// ════════════════════════════════════════════════════════════════════
import Fastify        from "npm:fastify";
import fjwt           from "npm:@fastify/jwt";
import { Pool }       from "npm:pg";

// ── Financial Kernel (المصدر الوحيد للحقيقة) ──────────────────────

// MONEY: وحدة الحساب = millimes (1 جنيه = 1000 millime)
// السبب: نتجنب كسور الـ cents عند حساب الفائدة الشهرية
class Money {
  private constructor(public readonly ml: bigint) {
    if (ml < 0n) throw new Error(`Money negative: ${ml}`);
  }
  static fromML(ml: bigint)      { return new Money(ml); }
  static fromCents(c: bigint)    { return new Money(c * 10n); }
  static fromPounds(s: string)   {
    const [i = "0", f = ""] = String(s).trim().split(".");
    return new Money(BigInt(i) * 1000n + BigInt(f.padEnd(3,"0").slice(0,3)));
  }
  static zero()                  { return new Money(0n); }
  add(o: Money)                  { return new Money(this.ml + o.ml); }
  sub(o: Money)                  {
    if (o.ml > this.ml) throw new Error(`Underflow: ${this.ml}-${o.ml}`);
    return new Money(this.ml - o.ml);
  }
  // ضرب في basis points: بدون float
  bps(b: number)                 { return new Money((this.ml * BigInt(b)) / 10000n); }
  gte(o: Money)                  { return this.ml >= o.ml; }
  gt(o: Money)                   { return this.ml > o.ml; }
  isZero()                       { return this.ml === 0n; }
  toCents()                      { return this.ml / 10n; }           // للـ DB القديم
  toPounds()                     {
    const w = this.ml / 1000n;
    const f = (this.ml % 1000n).toString().padStart(3,"0");
    return `${w}.${f}`;
  }
  toNum()                        { return Number(this.ml) / 1000; }
}

// AMORTIZATION: Declining Balance — المعادلة البنكية الصحيحة
function buildSchedule(principalML: bigint, annualBps: number, months: number, start: Date) {
  // PMT بـ float مرة واحدة فقط — الدقة في جدول الـ bigint
  let monthlyML: bigint;
  if (annualBps === 0) {
    monthlyML = principalML / BigInt(months) + 1n;
  } else {
    const r = annualBps / 12 / 10000;
    const P = Number(principalML);
    const f = Math.pow(1 + r, months);
    monthlyML = BigInt(Math.ceil((P * r * f) / (f - 1)));
  }

  const DENOM = 120000n; // 12 × 10000
  const bpsN  = BigInt(annualBps);
  const rows  = [];
  let balance = principalML;
  let totalInterest = 0n;

  for (let i = 1; i <= months; i++) {
    const interest   = (balance * bpsN) / DENOM;
    let   principal  = monthlyML - interest;
    if (i === months || principal > balance) principal = balance; // الشهر الأخير
    const total      = principal + interest;
    balance         -= principal;
    totalInterest   += interest;

    const due = new Date(start);
    due.setMonth(due.getMonth() + i);

    rows.push({ i, due, principal, interest, total, balance });
  }
  return { monthlyML, totalInterest, rows };
}

// WATERFALL: غرامات → فائدة → أصل
function waterfall(payment: Money, penalty: Money, interest: Money, principal: Money) {
  let rem = payment.ml;
  const take = (avail: bigint) => { const t = rem >= avail ? avail : rem; rem -= t; return t; };
  const pPaid = take(penalty.ml);
  const iPaid = take(interest.ml);
  const xPaid = take(principal.ml);
  return {
    penaltyPaid:   Money.fromML(pPaid),
    interestPaid:  Money.fromML(iPaid),
    principalPaid: Money.fromML(xPaid),
    change:        Money.fromML(rem),
    remaining:     Money.fromML((penalty.ml - pPaid) + (interest.ml - iPaid) + (principal.ml - xPaid)),
  };
}

// JOURNAL: Double-Entry — مدين = دائن دايماً
type Side = "DR"|"CR";
interface Line { acc: string; side: Side; ml: bigint; note: string; }
function journal(tenantId: string, ref: string, desc: string, lines: Line[]) {
  const dr = lines.filter(l=>l.side==="DR").reduce((s,l)=>s+l.ml, 0n);
  const cr = lines.filter(l=>l.side==="CR").reduce((s,l)=>s+l.ml, 0n);
  if (dr !== cr) throw new Error(`UNBALANCED JOURNAL: DR=${dr} CR=${cr}`);
  return { id: crypto.randomUUID(), tenantId, ref, desc, currency: "EGP", lines, createdAt: new Date() };
}
function saveJournal(client: any, entry: ReturnType<typeof journal>) {
  return client.query(
    `INSERT INTO journal_entries (tenant_id, reference, description, currency, lines)
     VALUES ($1,$2,$3,$4,$5)`,
    [entry.tenantId, entry.ref, entry.desc, entry.currency,
     JSON.stringify(entry.lines, (_,v) => typeof v==="bigint" ? v.toString() : v)]
  );
}

// PENALTY: غرامة تأخير يومية
function calcPenalty(overdueML: bigint, dailyBps: number, days: number): Money {
  if (days <= 0 || dailyBps <= 0) return Money.zero();
  return Money.fromML((overdueML * BigInt(dailyBps) / 10000n) * BigInt(days));
}

// ── Server ─────────────────────────────────────────────────────────
const PORT       = Number(Deno.env.get("PORT")        ?? 3011);
const JWT_SECRET = Deno.env.get("JWT_SECRET")         ?? "selfni-dev-secret-change-in-prod";
const DB_URL     = Deno.env.get("DATABASE_URL")       ?? "postgresql://u0_a202@localhost/selfni_core";

const pool = new Pool({ connectionString: DB_URL, max: 10 });
const app  = Fastify({ logger: false });
await app.register(fjwt, { secret: JWT_SECRET });

const auth = { preHandler: [async (req: any, rep: any) => {
  try { await req.jwtVerify(); } catch { rep.code(401).send({ error: "UNAUTHORIZED" }); }
}]};

// ── Routes ─────────────────────────────────────────────────────────

app.get("/health", () => ({
  status: "ok", service: "gfos-core", version: "2.0.0",
  timestamp: new Date().toISOString(),
}));

// AUTH
app.post("/auth/login", async (req: any, rep) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return rep.code(400).send({ error: "MISSING_FIELDS" });
  const db = await pool.connect();
  try {
    const r = await db.query(
      `SELECT id, username, email, password_hash, role FROM users WHERE email=$1 LIMIT 1`, [email]
    );
    if (!r.rows.length) return rep.code(401).send({ error: "INVALID_CREDENTIALS" });
    const u = r.rows[0];
    // TODO: bcrypt — للآن plain text للتطوير
    if (u.password_hash !== password) return rep.code(401).send({ error: "INVALID_CREDENTIALS" });
    const token = await rep.jwtSign(
      { userId: String(u.id), email: u.email, role: u.role }, { expiresIn: "24h" }
    );
    return { token, user: { id: u.id, username: u.username, email: u.email, role: u.role } };
  } finally { db.release(); }
});

// CUSTOMERS
app.get("/customers", auth, async (req: any) => {
  const db = await pool.connect();
  try {
    const r = await db.query(
      `SELECT id, name, phone, national_id, created_at
       FROM customers WHERE tenant_id=$1 ORDER BY created_at DESC`,
      [req.user.userId]
    );
    return r.rows;
  } finally { db.release(); }
});

app.post("/customers", auth, async (req: any, rep) => {
  const { name, phone, national_id } = req.body ?? {};
  if (!name || !phone) return rep.code(400).send({ error: "MISSING_FIELDS" });
  const db = await pool.connect();
  try {
    const r = await db.query(
      `INSERT INTO customers (name, phone, national_id, tenant_id)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, phone, national_id ?? null, req.user.userId]
    );
    return rep.code(201).send(r.rows[0]);
  } catch (e: any) {
    if (e.code === "23505") return rep.code(409).send({ error: "PHONE_EXISTS" });
    throw e;
  } finally { db.release(); }
});

// DEBTS
app.post("/debts", auth, async (req: any, rep) => {
  const { customer_id, principal_pounds, annual_rate_bps, term_months } = req.body ?? {};
  if (!customer_id || !principal_pounds || annual_rate_bps == null || !term_months)
    return rep.code(400).send({ error: "MISSING_FIELDS" });

  const principal = Money.fromPounds(String(principal_pounds));
  if (principal.isZero())        return rep.code(400).send({ error: "INVALID_PRINCIPAL" });
  if (annual_rate_bps < 0 || annual_rate_bps > 50000)
                                 return rep.code(400).send({ error: "INVALID_RATE" });
  if (term_months < 1 || term_months > 360)
                                 return rep.code(400).send({ error: "INVALID_TERM" });

  const db = await pool.connect();
  try {
    await db.query("BEGIN");

    // تحقق من العميل
    const cust = await db.query(
      `SELECT id FROM customers WHERE id=$1 AND tenant_id=$2`, [customer_id, req.user.userId]
    );
    if (!cust.rows.length) { await db.query("ROLLBACK"); return rep.code(404).send({ error: "CUSTOMER_NOT_FOUND" }); }

    // بناء جدول الأقساط
    const { monthlyML, totalInterest, rows } = buildSchedule(
      principal.ml, annual_rate_bps, term_months, new Date()
    );

    // حفظ الدين — principal_cents = millimes/10
    const dr = await db.query(
      `INSERT INTO debt_agreements
         (customer_id, user_id, principal_cents, currency, annual_rate_bps, term_months, amort_type, status)
       VALUES ($1,$2,$3,'EGP',$4,$5,'DECLINING','ACTIVE') RETURNING id`,
      [customer_id, req.user.userId, principal.toCents(), annual_rate_bps, term_months]
    );
    const debtId = dr.rows[0].id;

    // حفظ الجدول
    for (const row of rows) {
      await db.query(
        `INSERT INTO amortization_schedule
           (debt_id, installment_number, due_date,
            principal_cents, interest_cents, total_payment_cents, remaining_balance_cents, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'PENDING')`,
        [debtId, row.i, row.due,
         Money.fromML(row.principal).toCents(),
         Money.fromML(row.interest).toCents(),
         Money.fromML(row.total).toCents(),
         Money.fromML(row.balance).toCents()]
      );
    }

    // قيد محاسبي — DR LOAN_RECEIVABLE / CR UNEARNED_INCOME
    const je = journal(req.user.userId, `DEBT-${debtId}`, "Debt Agreement Created", [
      { acc: "LOAN_RECEIVABLE", side: "DR", ml: principal.ml, note: `Debt ${debtId}` },
      { acc: "UNEARNED_INCOME", side: "CR", ml: principal.ml, note: `Debt ${debtId}` },
    ]);
    await saveJournal(db, je);

    await db.query("COMMIT");
    return rep.code(201).send({
      debtId,
      principalPounds:      principal.toPounds(),
      monthlyPaymentPounds: Money.fromML(monthlyML).toPounds(),
      totalInterestPounds:  Money.fromML(totalInterest).toPounds(),
      termMonths:           term_months,
      annualRatePct:        (annual_rate_bps / 100).toFixed(2) + "%",
      firstDueDate:         rows[0].due,
    });
  } catch (e) { await db.query("ROLLBACK"); throw e; }
  finally { db.release(); }
});

// SCHEDULE
app.get("/debts/:debtId/schedule", auth, async (req: any, rep) => {
  const db = await pool.connect();
  try {
    const r = await db.query(
      `SELECT s.* FROM amortization_schedule s
       JOIN debt_agreements d ON s.debt_id = d.id
       WHERE s.debt_id=$1 AND d.user_id=$2 ORDER BY s.installment_number`,
      [req.params.debtId, req.user.userId]
    );
    if (!r.rows.length) return rep.code(404).send({ error: "DEBT_NOT_FOUND" });
    return r.rows.map((s: any) => ({
      installmentNumber: s.installment_number,
      dueDate:           s.due_date,
      status:            s.status,
      paidAt:            s.paid_at,
      principalPounds:   Money.fromCents(BigInt(s.principal_cents)).toPounds(),
      interestPounds:    Money.fromCents(BigInt(s.interest_cents)).toPounds(),
      totalPounds:       Money.fromCents(BigInt(s.total_payment_cents)).toPounds(),
      remainingPounds:   Money.fromCents(BigInt(s.remaining_balance_cents)).toPounds(),
    }));
  } finally { db.release(); }
});

// PAYMENTS
app.post("/payments", auth, async (req: any, rep) => {
  const { debt_id, amount_pounds } = req.body ?? {};
  if (!debt_id || !amount_pounds) return rep.code(400).send({ error: "MISSING_FIELDS" });

  const payment = Money.fromPounds(String(amount_pounds));
  if (payment.isZero()) return rep.code(400).send({ error: "INVALID_AMOUNT" });

  const db = await pool.connect();
  try {
    await db.query("BEGIN");

    // تحقق من الدين
    const dr = await db.query(
      `SELECT * FROM debt_agreements WHERE id=$1 AND user_id=$2 AND status='ACTIVE'`,
      [debt_id, req.user.userId]
    );
    if (!dr.rows.length) { await db.query("ROLLBACK"); return rep.code(404).send({ error: "DEBT_NOT_FOUND" }); }

    // القسط المستحق التالي
    const ir = await db.query(
      `SELECT * FROM amortization_schedule
       WHERE debt_id=$1 AND status='PENDING' ORDER BY installment_number LIMIT 1`,
      [debt_id]
    );
    if (!ir.rows.length) { await db.query("ROLLBACK"); return rep.code(400).send({ error: "DEBT_FULLY_PAID" }); }

    const inst     = ir.rows[0];
    const instInt  = Money.fromCents(BigInt(inst.interest_cents));
    const instPrin = Money.fromCents(BigInt(inst.principal_cents));
    const instTot  = Money.fromCents(BigInt(inst.total_payment_cents));

    // غرامة تأخير
    const daysOverdue = Math.max(0,
      Math.floor((Date.now() - new Date(inst.due_date).getTime()) / 86400000)
    );
    const penalty = calcPenalty(instTot.ml, 5, daysOverdue); // 0.05% يومياً

    // Waterfall
    const wf = waterfall(payment, penalty, instInt, instPrin);

    // حفظ الدفعة
    const pr = await db.query(
      `INSERT INTO payments
         (debt_id, amount_cents, currency, penalties_paid, interest_paid, principal_paid, remaining)
       VALUES ($1,$2,'EGP',$3,$4,$5,$6) RETURNING id`,
      [debt_id,
       payment.toCents(),
       wf.penaltyPaid.toCents(),
       wf.interestPaid.toCents(),
       wf.principalPaid.toCents(),
       wf.remaining.toCents()]
    );
    const paymentId = pr.rows[0].id;

    // تحديث القسط لو سُدّد الأصل كاملاً
    if (wf.principalPaid.ml >= instPrin.ml) {
      await db.query(
        `UPDATE amortization_schedule SET status='PAID', paid_at=NOW() WHERE id=$1`, [inst.id]
      );
    }

    // تحقق لو الدين اتسدد كله
    const pending = await db.query(
      `SELECT COUNT(*) FROM amortization_schedule WHERE debt_id=$1 AND status='PENDING'`, [debt_id]
    );
    if (Number(pending.rows[0].count) === 0) {
      await db.query(`UPDATE debt_agreements SET status='SETTLED' WHERE id=$1`, [debt_id]);
    }

    // قيد محاسبي
    // DR CASH_ASSET
    // DR UNEARNED_INCOME (تحويل الفائدة من غير مكتسبة)
    // CR PENALTY_INCOME / CR INTEREST_INCOME / CR LOAN_RECEIVABLE
    const lines: Line[] = [
      { acc: "CASH_ASSET", side: "DR", ml: wf.penaltyPaid.ml + wf.interestPaid.ml + wf.principalPaid.ml, note: `PMT ${paymentId}` },
    ];
    if (!wf.penaltyPaid.isZero())
      lines.push({ acc: "PENALTY_INCOME",  side: "CR", ml: wf.penaltyPaid.ml,  note: `Penalty ${paymentId}` });
    if (!wf.interestPaid.isZero())
      lines.push({ acc: "INTEREST_INCOME", side: "CR", ml: wf.interestPaid.ml, note: `Interest ${paymentId}` });
    if (!wf.principalPaid.isZero())
      lines.push({ acc: "LOAN_RECEIVABLE", side: "CR", ml: wf.principalPaid.ml, note: `Principal ${paymentId}` });

    // تعديل DR ليشمل الـ UNEARNED_INCOME المضاف
    // DR CASH + DR UNEARNED = CR PENALTY + CR INTEREST + CR LOAN
    const je = journal(req.user.userId, `PMT-${paymentId}`, "Payment Received", lines);
    await saveJournal(db, je);

    await db.query("COMMIT");
    return rep.code(201).send({
      paymentId,
      amountPounds:        payment.toPounds(),
      penaltyPounds:       wf.penaltyPaid.toPounds(),
      interestPounds:      wf.interestPaid.toPounds(),
      principalPounds:     wf.principalPaid.toPounds(),
      changePounds:        wf.change.toPounds(),
      remainingDebtPounds: wf.remaining.toPounds(),
      isFullySettled:      wf.remaining.isZero(),
      daysOverdue,
    });
  } catch (e) { await db.query("ROLLBACK"); throw e; }
  finally { db.release(); }
});

// OVERDUE
app.get("/installments/overdue", auth, async (req: any) => {
  const db = await pool.connect();
  try {
    const r = await db.query(
      `SELECT s.id, s.debt_id, s.installment_number, s.due_date,
              s.total_payment_cents, s.remaining_balance_cents,
              c.name as customer_name, c.phone as customer_phone,
              EXTRACT(DAY FROM NOW() - s.due_date)::int as days_overdue
       FROM amortization_schedule s
       JOIN debt_agreements d ON s.debt_id = d.id
       JOIN customers c ON d.customer_id = c.id
       WHERE d.user_id=$1 AND s.status='PENDING' AND s.due_date < NOW()
       ORDER BY s.due_date ASC`,
      [req.user.userId]
    );
    return r.rows.map((s: any) => {
      const tot = Money.fromCents(BigInt(s.total_payment_cents));
      const pen = calcPenalty(tot.ml, 5, s.days_overdue);
      return {
        id:               s.id,
        debtId:           s.debt_id,
        installmentNumber: s.installment_number,
        dueDate:          s.due_date,
        daysOverdue:      s.days_overdue,
        customerName:     s.customer_name,
        customerPhone:    s.customer_phone,
        totalPounds:      tot.toPounds(),
        penaltyPounds:    pen.toPounds(),
        totalWithPenalty: tot.add(pen).toPounds(),
      };
    });
  } finally { db.release(); }
});

// DASHBOARD
app.get("/dashboard", auth, async (req: any) => {
  const db = await pool.connect();
  try {
    const [c, d, o, p] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM customers WHERE tenant_id=$1`, [req.user.userId]),
      db.query(`SELECT COUNT(*), COALESCE(SUM(principal_cents),0) as total
                FROM debt_agreements WHERE user_id=$1 AND status='ACTIVE'`, [req.user.userId]),
      db.query(`SELECT COUNT(*) FROM amortization_schedule s
                JOIN debt_agreements d ON s.debt_id=d.id
                WHERE d.user_id=$1 AND s.status='PENDING' AND s.due_date<NOW()`, [req.user.userId]),
      db.query(`SELECT COALESCE(SUM(amount_cents),0) as total FROM payments p
                JOIN debt_agreements d ON p.debt_id=d.id WHERE d.user_id=$1`, [req.user.userId]),
    ]);
    return {
      totalCustomers:       Number(c.rows[0].count),
      activeDebts:          Number(d.rows[0].count),
      portfolioPounds:      Money.fromCents(BigInt(d.rows[0].total)).toPounds(),
      overdueInstallments:  Number(o.rows[0].count),
      totalCollectedPounds: Money.fromCents(BigInt(p.rows[0].total)).toPounds(),
    };
  } finally { db.release(); }
});

// ── Start ──────────────────────────────────────────────────────────
console.log("═══════════════════════════════════════════");
console.log("🏦  GFOS Core — Banking-Grade Financial OS");
console.log("═══════════════════════════════════════════");
try {
  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`✅  Server  : http://localhost:${PORT}`);
  console.log(`✅  Database: selfni_core`);
  console.log(`✅  Engine  : Declining Balance · BigInt · Double-Entry`);
  console.log("═══════════════════════════════════════════");
} catch (e) { console.error("❌", e); Deno.exit(1); }
