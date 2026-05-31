# 🏦 GFOS Core - Global Financial Operating System

**Phase 0: Foundation** - Simplest working financial system

## 🎯 What This Does (MVP)

```
1. Create a Debt
2. Post it to the General Ledger (Debit AR, Credit Revenue)
3. Query debt details
4. Verify ledger is balanced (Debit = Credit always)
```

## 🛠️ Tech Stack

- **Backend**: Node.js + TypeScript
- **Database**: PostgreSQL
- **Testing**: Jest
- **Architecture**: Domain-Driven Design + Event-Sourcing ready

## 🚀 Quick Start

### 1. Start PostgreSQL

```bash
docker-compose up -d
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run migrations

```bash
npm run db:migrate
```

### 4. Start the server

```bash
npm run dev
```

## 📡 API Usage

### Create Debt

```bash
curl -X POST http://localhost:3000/debts \
  -H 'x-tenant-id: tenant-1' \
  -H 'Content-Type: application/json' \
  -d '{
    "customerId": "cust-1",
    "principal": 100000,
    "currency": "USD"
  }'
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

## 🧪 Run Tests

```bash
npm test
```

## 📚 Core Rules Enforced

✅ **Debit = Credit always** - The ledger is the source of truth  
✅ **Immutable entries** - Posted entries cannot be modified, only reversed  
✅ **No direct balance updates** - All changes go through journal entries  
✅ **Financial precision** - All money stored as BIGINT (minor units)  
✅ **Multi-tenant isolation** - Tenant data completely isolated  
✅ **Full audit trail** - Every operation logged  

## 📂 Project Structure

```
src/
├── domain/
│   ├── ledger/        # Ledger Engine (source of truth)
│   └── debt/          # Debt Service
├── infrastructure/
│   └── database/      # Schema, migrations, connection
├── interfaces/
│   └── http/          # REST API
├── shared/
│   └── types.ts       # Type definitions
└── index.ts           # Bootstrap
```

## 🔄 Next Steps (Phase 1+)

- [ ] Payment processing
- [ ] Allocation engine (split payments)
- [ ] Penalty calculation
- [ ] Interest accrual
- [ ] Reports (Balance Sheet, Income Statement)
- [ ] Reconciliation engine

## 📋 Financial Invariants Being Tested

- Total Debits = Total Credits (always)
- No orphan journal lines
- No posting to closed periods
- Customer exists before debt creation
- All money in BIGINT minor units

---

**Built with financial correctness first, everything else second.** ✨
