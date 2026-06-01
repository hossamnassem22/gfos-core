# 🎯 EVENT CATALOG

## فهرس الأحداث المالية

كل حدث مالي يجب أن يكون معرّفاً بدقة.

---

## Event: DEBT_CREATED

```typescript
interface DebtCreatedEvent {
  eventId: string;
  eventType: 'DEBT_CREATED';
  tenantId: string;
  aggregateId: string;  // debtId
  
  payload: {
    debtId: string;
    customerId: string;
    principal: string;  // BigInt as string
    currency: string;
    interestRate: string;
    dueDate: Date;
    createdBy: string;
    journalEntryId: string; // Link to ledger
  };
  
  occurredAt: Date;
  recordedAt: Date;
  source: 'API' | 'SYSTEM';
}
```

### Subscribers:
- Notification Service (send confirmation)
- Risk Service (update exposure)
- Reporting Service (update dashboard)

---

## Event: PAYMENT_RECEIVED

```typescript
interface PaymentReceivedEvent {
  eventType: 'PAYMENT_RECEIVED';
  
  payload: {
    paymentId: string;
    debtId: string;
    customerId: string;
    amount: string;  // BigInt as string
    method: 'BANK_TRANSFER' | 'CASH' | 'CHECK';
    transactionRef: string;
    journalEntryId: string;
  };
  
  occurredAt: Date;
}
```

---

## Event: INTEREST_ACCRUED

```typescript
interface InterestAccruedEvent {
  eventType: 'INTEREST_ACCRUED';
  
  payload: {
    debtId: string;
    amount: string;  // Accrued interest
    ruleVersion: string;  // Which interest rule
    journalEntryId: string;
  };
  
  occurredAt: Date;
}
```

---

## Event: PENALTY_APPLIED

```typescript
interface PenaltyAppliedEvent {
  eventType: 'PENALTY_APPLIED';
  
  payload: {
    debtId: string;
    daysLate: number;
    amount: string;
    ruleVersion: string;
    journalEntryId: string;
  };
  
  occurredAt: Date;
}
```

---

## Event: JOURNAL_POSTED

```typescript
interface JournalPostedEvent {
  eventType: 'JOURNAL_POSTED';
  
  payload: {
    journalEntryId: string;
    entryNumber: number;
    description: string;
    totalDebit: string;
    totalCredit: string;
    sourceEntity?: string;  // What created this
    sourceEvent?: string;   // Which event caused it
  };
  
  occurredAt: Date;
}
```

---

## Event: ALLOCATION_CREATED

```typescript
interface AllocationCreatedEvent {
  eventType: 'ALLOCATION_CREATED';
  
  payload: {
    allocationId: string;
    paymentId: string;
    debtId: string;
    fees: string;
    interest: string;
    penalties: string;
    principal: string;
    journalEntryId: string;
  };
  
  occurredAt: Date;
}
```

---

## Event Publishing Rules

```typescript
export class EventBus {
  async publish<T extends Event>(event: T): Promise<void> {
    // 1. Validate event schema
    validateEventSchema(event);
    
    // 2. Save to event store
    await eventStore.save(event);
    
    // 3. Publish to subscribers
    const subscribers = this.getSubscribers(event.eventType);
    
    for (const subscriber of subscribers) {
      try {
        await subscriber.handle(event);
      } catch (error) {
        // Log error, don't fail
        logger.error(`Subscriber error: ${error.message}`);
      }
    }
  }
}
```

---

**Last Updated:** 2026-05-31
**Status:** ACTIVE
