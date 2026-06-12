import { FastifyInstance } from "npm:fastify";
import { requireAuth } from "../middleware/auth.ts";
import { JournalRepository } from "@infra/persistence/JournalRepository.ts";
import { JournalEngine } from "@core/ledger/JournalEngine.ts";

const journalRepo = new JournalRepository();

export async function ledgerRoutes(app: FastifyInstance) {

  // Trial Balance
  app.get("/ledger/trial-balance", { preHandler: requireAuth }, async (req) => {
    const { userId } = (req as any).user;
    const rows = await journalRepo.getTrialBalance(userId);
    const totalDebits  = rows.reduce((s, r) => s + r.totalDebits,  0n);
    const totalCredits = rows.reduce((s, r) => s + r.totalCredits, 0n);
    return {
      rows: rows.map(r => ({
        account:      r.account,
        totalDebits:  r.totalDebits.toString(),
        totalCredits: r.totalCredits.toString(),
        balance:      r.balance.toString(),
      })),
      totals: {
        debits:   totalDebits.toString(),
        credits:  totalCredits.toString(),
        balanced: totalDebits === totalCredits,
      }
    };
  });

  // Journal Entries
  app.get("/ledger/journal", { preHandler: requireAuth }, async (req) => {
    const { userId } = (req as any).user;
    const entries = await journalRepo.findByTenant(userId);
    return entries.map(e => ({
      id:          e.id,
      reference:   e.reference,
      description: e.description,
      currency:    e.currency,
      createdAt:   e.createdAt,
      lines:       e.lines.map((l: any) => ({
        account: l.account,
        type:    l.type,
        amount:  l.amount.toString(),
      })),
    }));
  });

  // تسجيل دفعة
  app.post("/ledger/post-payment", { preHandler: requireAuth }, async (req, reply) => {
    const { userId } = (req as any).user;
    const { reference, currency, amountCents, principalCents, interestCents, penaltiesCents } = req.body as any;

    if (!reference || !amountCents)
      return reply.status(400).send({ error: "reference و amountCents مطلوبان" });

    const total = BigInt(principalCents ?? 0) + BigInt(interestCents ?? 0) + BigInt(penaltiesCents ?? 0);
    if (total !== BigInt(amountCents))
      return reply.status(400).send({ error: "مجموع المكونات لا يساوي الإجمالي" });

    const entry = JournalEngine.createPaymentEntry({
      tenantId:       userId,
      reference,
      currency:       currency ?? "EGP",
      amountCents:    BigInt(amountCents),
      principalCents: BigInt(principalCents ?? 0),
      interestCents:  BigInt(interestCents ?? 0),
      penaltiesCents: BigInt(penaltiesCents ?? 0),
    });

    await journalRepo.save(entry);
    return {
      entryId:  entry.id,
      balanced: true,
      lines:    entry.lines.map(l => ({ account: l.account, type: l.type, amount: l.amount.toString() })),
    };
  });

  // تسجيل دين جديد
  app.post("/ledger/post-debt", { preHandler: requireAuth }, async (req, reply) => {
    const { userId } = (req as any).user;
    const { reference, currency, principalCents } = req.body as any;

    if (!reference || !principalCents)
      return reply.status(400).send({ error: "reference و principalCents مطلوبان" });

    const entry = JournalEngine.createDebtEntry({
      tenantId:       userId,
      reference,
      currency:       currency ?? "EGP",
      principalCents: BigInt(principalCents),
    });

    await journalRepo.save(entry);
    return {
      entryId:  entry.id,
      balanced: true,
      lines:    entry.lines.map(l => ({ account: l.account, type: l.type, amount: l.amount.toString() })),
    };
  });
}
