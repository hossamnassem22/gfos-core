# ⚠️ ERROR CATALOG

## فهرس رموز الأخطاء المالية

كل خطأ يجب أن يكون معرّفاً بدقة بدلاً من رسائل عشوائية.

---

## Error: INSUFFICIENT_FUNDS

```typescript
code: 'INSUFFICIENT_FUNDS'
status: 400
message: 'Customer does not have sufficient balance for this transaction'
recommendation: 'Check customer balance or reduce transaction amount'
```

---

## Error: PERIOD_CLOSED

```typescript
code: 'PERIOD_CLOSED'
status: 403
message: 'Cannot post to closed fiscal period'
recommendation: 'Post to open period or reopen period with approval'
```

---

## Error: DUPLICATE_POSTING

```typescript
code: 'DUPLICATE_POSTING'
status: 409
message: 'Journal entry with this idempotency key already exists'
recommendation: 'Use different idempotency key or retrieve existing entry'
```

---

## Error: INVALID_EFFECTIVE_DATE

```typescript
code: 'INVALID_EFFECTIVE_DATE'
status: 400
message: 'Effective date is in the future or outside fiscal period'
recommendation: 'Use date within open fiscal period'
```

---

## Error: LIMIT_EXCEEDED

```typescript
code: 'LIMIT_EXCEEDED'
status: 403
message: 'Transaction exceeds customer credit limit'
recommendation: 'Reduce amount or increase customer limit'
```

---

**Last Updated:** 2026-05-31
**Status:** ACTIVE
