import { BaseSubscriber } from "../../collections/subscribers/BaseSubscriber.ts";
import { InMemoryProcessedEventRepository } from "../../collections/subscribers/InMemoryProcessedEventRepository.ts";

class TestSubscriber extends BaseSubscriber {
  public callCount = 0;
  public shouldFail = false;

  protected async handle(event: any): Promise<void> {
    if (this.shouldFail) throw new Error("Intentional failure");
    this.callCount++;
  }
}

async function runTest() {
  const repo = new InMemoryProcessedEventRepository();
  const sub = new TestSubscriber("TEST_SUB", repo);
  const event = { id: "EVT-123", customerId: "CUST-01", type: "TEST", timestamp: new Date() };

  // Level 1: Failure Recovery
  sub.shouldFail = true;
  try { await sub.process(event as any); } catch {}
  console.log("Call count after failure:", sub.callCount); // Expected 0

  sub.shouldFail = false;
  await sub.process(event as any);
  console.log("Call count after retry:", sub.callCount);   // Expected 1

  // Level 2: Idempotency (Happy Path)
  await sub.process(event as any);
  console.log("Call count after duplicate:", sub.callCount); // Expected 1

  if (sub.callCount === 1) {
    console.log("✔ IDEMPOTENCY CONTRACT VERIFIED");
  } else {
    throw new Error("Idempotency failed");
  }
}

runTest().catch((err) => { console.error(err); Deno.exit(1); });
