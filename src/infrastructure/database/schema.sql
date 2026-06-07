CREATE TABLE IF NOT EXISTS ledger_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL,
  account_id    TEXT NOT NULL,
  amount_cents  BIGINT NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'EGP',
  entry_type    TEXT NOT NULL CHECK (entry_type IN ('DEBIT', 'CREDIT')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS debt_agreements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT NOT NULL,
  principal_cents BIGINT NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'EGP',
  annual_rate_bps INT NOT NULL,
  term_months     INT NOT NULL,
  amort_type      TEXT NOT NULL DEFAULT 'DECLINING',
  status          TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS amortization_schedule (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debt_id               UUID NOT NULL REFERENCES debt_agreements(id),
  installment_number    INT NOT NULL,
  due_date              DATE NOT NULL,
  principal_cents       BIGINT NOT NULL,
  interest_cents        BIGINT NOT NULL,
  total_payment_cents   BIGINT NOT NULL,
  remaining_balance_cents BIGINT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'PENDING',
  paid_at               TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debt_id           UUID NOT NULL REFERENCES debt_agreements(id),
  amount_cents      BIGINT NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'EGP',
  penalties_paid    BIGINT NOT NULL DEFAULT 0,
  interest_paid     BIGINT NOT NULL DEFAULT 0,
  principal_paid    BIGINT NOT NULL DEFAULT 0,
  remaining         BIGINT NOT NULL DEFAULT 0,
  paid_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ledger_user ON ledger_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_schedule_debt ON amortization_schedule(debt_id);
CREATE INDEX IF NOT EXISTS idx_payments_debt ON payments(debt_id);
