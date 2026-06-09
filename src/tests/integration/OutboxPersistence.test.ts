import { PostgresOutboxRepository } from "../../infrastructure/outbox/PostgresOutboxRepository.ts";
import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

async function runPersistenceTest() {
  const pool = new Pool(Deno.env.get("DATABASE_URL"), 1);
  const repo = new PostgresOutboxRepository(pool);

  const eventId = crypto.randomUUID();
  const event = {
    id: eventId,
    aggregateId: "CUST-1",
    aggregateType: "COLLECTION",
    eventType: "PAYMENT_RECEIVED",
    payload: { amount: 100 },
    status: "PENDING",
    version: 1,
    retryCount: 0,
    createdAt: new Date()
  };

  await repo.save(event as any, pool as any);
  const pending = await repo.claimPending(1);

  if (pending.length === 1 && pending[0].id === eventId) {
    console.log("✔ SUCCESS: Event claimed correctly");
  } else {
    throw new Error("Persistence test failed: Event not claimed");
  }

  const secondClaim = await repo.claimPending(1);
  if (secondClaim.length === 0) {
    console.log("✔ SUCCESS: SKIP LOCKED working - no double claim");
  } else {
    throw new Error("Persistence test failed: Double claim occurred");
  }
}

runPersistenceTest().catch(console.error);
