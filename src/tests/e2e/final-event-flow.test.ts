import { CollectionsOrchestrator } from "../../collections/orchestration/CollectionsOrchestrator.ts";
import { InMemoryStateRepository } from "../../collections/state/InMemoryStateRepository.ts";
import { CollectionsStateMachine } from "../../collections/state/StateMachine.ts";
import { InMemoryEventBus } from "../../collections/events/EventBus.ts";
import { LedgerFacade } from "../../accounting/LedgerFacade.ts";
import { AgingEngineImpl } from "../../accounting/aging/AgingEngine.ts";
import { RiskScoringLayerImpl } from "../../accounting/risk/RiskScoringLayer.ts";

async function runTest() {
  const stateRepo = new InMemoryStateRepository();
  const eventBus = new InMemoryEventBus();
  const ledger = new LedgerFacade();
  const customerId = "CUST-001";
  const receivedEvents: any[] = [];

  // Subscriber (Verification Layer)
  eventBus.subscribe(async (event) => {
    receivedEvents.push(event);
  });

  const orchestrator = new CollectionsOrchestrator(
    ledger,
    new AgingEngineImpl(),
    new RiskScoringLayerImpl(),
    stateRepo,
    new CollectionsStateMachine(),
    eventBus
  );

  // Seed financial data
  await ledger.postEntry({ 
    customerId, 
    date: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), 
    amount: 30000, 
    direction: "DEBIT", 
    referenceId: "INV_CRITICAL" 
  });

  // Seed initial state
  await stateRepo.save({ customerId, state: "PENDING", updatedAt: new Date(), version: 1 });

  // Act
  await orchestrator.processCustomer(customerId);

  // Assert 1: State transition
  const finalState = await stateRepo.get(customerId);
  if (finalState?.state !== "ESCALATED") {
    throw new Error("State transition failed: Expected ESCALATED");
  }

  // Assert 2: Event emission
  const escalationEvent = receivedEvents.find((e) => e.type === "CUSTOMER_ESCALATED");
  if (!escalationEvent) {
    throw new Error("Event was not published: CUSTOMER_ESCALATED not found");
  }

  console.log("✔ EVENT FLOW VERIFIED");
  console.log("✔ STATE FLOW VERIFIED");
  console.log("✔ SYSTEM CONTRACT PASSED");
}

runTest().catch((err) => {
  console.error(err);
  Deno.exit(1);
});
