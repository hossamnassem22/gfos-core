# 🏦 GFOS Core - Global Financial Operating System

**Phase 0: Foundation** - Simplest working financial system with ledger-based architecture

## 📋 What This Does (MVP)

```
1. Create a Debt
2. Post it to the General Ledger (Debit AR, Credit Revenue)
3. Query debt details
4. Verify ledger is perfectly balanced (Debit = Credit always)
```

## 🏗️ Architecture

- **Ledger as Source of Truth**: Every financial transaction goes through the general ledger
- **Double-Entry Bookkeeping**: Debit = Credit enforced at DB and application level
- **Immutable Records**: Posted entries cannot be modified, only reversed
- **Multi-Tenant**: Complete data isolation
- **Event Sourcing Ready**: Events tracked for future replaying and auditing

## 🛠️ Tech Stack

- **Backend**: Node.js + TypeScript
- **Database**: PostgreSQL (16)
- **Testing**: Jest
- **Architecture**: Domain-Driven Design + Ledger Pattern

## 🚀 Quick Start

### 1. Start PostgreSQL

```bash
docker-compose up -d
```

### 2. Install dependencies

```bash
npm install
```

### 3. Copy environment file

```bash
cp .env.example .env
```

### 4. Run migrations

```bash
npm run db:migrate
```

### 5. Start the server

```bash
npm run dev
```

## 📡 API Usage

### Create Debt

```bash
curl -X POST http://localhost:3000/debts \
  -H 'x-tenant-id: tenant-1' \
  -H 'x-user-id: user-1' \
  -H 'Content-Type: application/json' \
  -d '{
    "customerId": "cust-1",
    "principal": 100000,
    "currency": "USD"
  }'
```

**Response:**
```json
{
  "success": true,
  "debtId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Debt created and posted to ledger"
}
```

### Get Debt

```bash
curl http://localhost:3000/debts/{debtId} \
  -H 'x-tenant-id: tenant-1'
```

### Verify Ledger Balance

```bash
curl http://localhost:3000/ledger/balance \
  -H 'x-tenant-id: tenant-1'
```

**Response:**
```json
{
  "success": true,
  "balanced": true,
  "message": "✅ Ledger is perfectly balanced"
}
```

## 🧪 Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Test Coverage

All tests verify:

✅ Debt creation flow
✅ Journal entry posting
✅ **Ledger balance verification** (Debit = Credit)
✅ Account type handling (ASSET, LIABILITY, EQUITY, INCOME, EXPENSE)
✅ Error handling and validation
✅ Multi-debt financial integrity

## 📚 Core Rules Enforced

### At Database Level

✅ **Double-Entry Constraint**: Every journal line must be debit OR credit, never both
✅ **Positive Money Only**: All amounts are BIGINT, no floats
✅ **Sequential Entry Numbers**: Entry_number is unique and sequential per tenant
✅ **Foreign Key Integrity**: All references enforced
✅ **Immutable Records**: Posted entries are never updated

### At Application Level

✅ **Debit = Credit Validation**: All journal entries must balance
✅ **Open Period Enforcement**: No posting to closed fiscal periods
✅ **Customer Validation**: Debt cannot be created for non-existent customers
✅ **Account Type Handling**: Balance calculation accounts for account types
  - ASSET/EXPENSE: Debit increases
  - LIABILITY/EQUITY/INCOME: Credit increases

### At Service Level

✅ **Atomic Transactions**: Debt + Journal Entry + Event in single transaction
✅ **Event Sourcing**: All state changes recorded as events
✅ **Audit Trail**: Every operation logged with user and timestamp

## 📂 Project Structure

```
src/
├── domain/
│   ├── ledger/
│   │   └── ledger-engine.ts         # Core posting logic
│   └── debt/
│       └── debt-service.ts          # Debt creation service
├── infrastructure/
│   └── database/
│       ├── schema.sql               # PostgreSQL schema
│       ├── connection.ts            # DB connection + transactions
│       └── migrations.ts            # Schema setup
├── interfaces/
│   └── http/
│       └── api.ts                   # REST endpoints
├── shared/
│   └── types.ts                     # Type definitions
├── __tests__/
│   └── debt.integration.test.ts     # Integration tests
└── index.ts                         # Bootstrap
```

## 🔍 Financial Integrity

The system guarantees:

1. **Ledger Balance Invariant**: `SUM(Debits) = SUM(Credits)` always
2. **No Orphan Entries**: Every debt must have a posted journal entry
3. **No Direct Balance Updates**: Balances are always derived from journal entries
4. **Account Type Awareness**: Balance calculation respects account types
5. **Immutable History**: Posted entries create an audit trail

## 🚀 Next Steps (Phase 1+)

- [ ] Payment processing and allocation
- [ ] Penalty and interest calculations
- [ ] Reversal handling
- [ ] Reconciliation engine
- [ ] Financial reporting (Trial Balance, Income Statement)
- [ ] API authentication (JWT)
- [ ] Rate limiting and security

## 🛡️ Security

- ✅ Parameterized SQL queries (no injection)
- ✅ Tenant isolation (every query scoped to tenant)
- ✅ No sensitive data in logs
- ✅ Transaction isolation
- ✅ Immutable audit trail

## 📊 Performance

- ✅ Indexed queries on tenant_id, status, date ranges
- ✅ Transaction batching for multiple operations
- ✅ Connection pooling
- ✅ Query optimization for large ledgers

## 📝 License

MIT

---

**Built with financial correctness first, everything else second.** 💰
