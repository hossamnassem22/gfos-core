-- GFOS Core Schema (Phase 0)
-- Single source of truth: General Ledger

-- 1. Tenants (Multi-tenant isolation)
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  base_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_currency CHECK (base_currency IN ('USD', 'EGP', 'EUR', 'AED'))
);

-- 2. Users (Authentication + Audit)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  UNIQUE(tenant_id, email)
);

-- 3. Chart of Accounts (GL Master)
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  parent_id UUID,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT fk_parent FOREIGN KEY (parent_id) REFERENCES accounts(id),
  CONSTRAINT valid_type CHECK (type IN ('ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE')),
  UNIQUE(tenant_id, code)
);

-- 4. Fiscal Periods (Financial Calendar)
CREATE TABLE IF NOT EXISTS fiscal_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  period_name VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
  locked_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT valid_status CHECK (status IN ('OPEN', 'SOFT_CLOSED', 'HARD_CLOSED', 'LOCKED')),
  UNIQUE(tenant_id, period_name)
);

-- 5. Journal Entries (IMMUTABLE - Single Source of Truth)
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  entry_number BIGINT NOT NULL,
  description VARCHAR(500) NOT NULL,
  posting_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
  reversal_of_id UUID,
  created_by UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  posted_at TIMESTAMP,
  posted_by UUID,
  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT fk_user FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_posted_by FOREIGN KEY (posted_by) REFERENCES users(id),
  CONSTRAINT fk_reversal FOREIGN KEY (reversal_of_id) REFERENCES journal_entries(id),
  CONSTRAINT valid_status CHECK (status IN ('DRAFT', 'POSTED', 'REVERSED')),
  UNIQUE(tenant_id, entry_number)
);

-- 6. Journal Lines (IMMUTABLE - Double Entry Enforcement)
CREATE TABLE IF NOT EXISTS journal_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID NOT NULL,
  account_id UUID NOT NULL,
  debit_amount BIGINT NOT NULL DEFAULT 0,
  credit_amount BIGINT NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  exchange_rate DECIMAL(18, 6) NOT NULL DEFAULT 1.0,
  description VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_entry FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id),
  CONSTRAINT fk_account FOREIGN KEY (account_id) REFERENCES accounts(id),
  CONSTRAINT debit_xor_credit CHECK ((debit_amount > 0 AND credit_amount = 0) OR (debit_amount = 0 AND credit_amount > 0)),
  CONSTRAINT non_negative CHECK (debit_amount >= 0 AND credit_amount >= 0)
);

-- 7. Customers (AR Module Start)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  credit_limit BIGINT NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL,
  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT fk_user FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT positive_limit CHECK (credit_limit >= 0),
  UNIQUE(tenant_id, email)
);

-- 8. Debts (Core Debt Module)
CREATE TABLE IF NOT EXISTS debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  principal BIGINT NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  originated_date DATE NOT NULL,
  due_date DATE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL,
  posted_journal_entry_id UUID,
  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
  CONSTRAINT fk_user FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_journal FOREIGN KEY (posted_journal_entry_id) REFERENCES journal_entries(id),
  CONSTRAINT positive_principal CHECK (principal > 0),
  CONSTRAINT valid_status CHECK (status IN ('ACTIVE', 'OVERDUE', 'PAID', 'WRITTEN_OFF', 'DISPUTED'))
);

-- 9. Audit Logs (Immutable Audit Trail)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  before_state JSONB,
  after_state JSONB,
  user_id UUID NOT NULL,
  ip_address VARCHAR(45),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- 10. Event Store (Event Sourcing)
CREATE TABLE IF NOT EXISTS event_store (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  aggregate_id UUID NOT NULL,
  payload JSONB NOT NULL,
  idempotency_key VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  UNIQUE(tenant_id, idempotency_key)
);

-- Indexes for Performance
CREATE INDEX idx_journal_entries_tenant_date ON journal_entries(tenant_id, posting_date);
CREATE INDEX idx_journal_entries_status ON journal_entries(tenant_id, status);
CREATE INDEX idx_journal_lines_account ON journal_lines(account_id);
CREATE INDEX idx_debts_customer ON debts(customer_id);
CREATE INDEX idx_debts_status ON debts(tenant_id, status);
CREATE INDEX idx_audit_logs_entity ON audit_logs(tenant_id, entity_type, entity_id);
CREATE INDEX idx_event_store_tenant ON event_store(tenant_id, created_at);
