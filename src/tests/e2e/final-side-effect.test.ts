import { CollectionsOrchestrator } from "../../collections/orchestration/CollectionsOrchestrator.ts";
import { InMemoryStateRepository } from "../../collections/state/InMemoryStateRepository.ts";
import { CollectionsStateMachine } from "../../collections/state/StateMachine.ts";
import { InMemoryEventBus } from "../../collections/events/EventBus.ts";
import { AuditSubscriber } from "../../collections/subscribers/AuditSubscriber.ts";
import { NotificationSubscriber } from "../../collections/subscribers/NotificationSubscriber.ts";
import { LedgerFacade } from "../../accounting/LedgerFacade.ts";
import { AgingEngineImpl } from "../../accounting/aging/AgingEngine.ts";
import { RiskScoringLayerImpl } from "../../accounting/risk/RiskScoringLayer.ts";

async function runTest() {
  const eventBus = new InMemoryEventBus();
  const audit = new AuditSubscriber();
  const notify = new NotificationSubscriber();

  // Wiring Subscribers
  eventBus.subscribe(async (e) => await audit.handle(e));
  eventBus.subscribe(async (e) => await notify.handle(e));

  const orchestrator = new CollectionsOrchestrator(
    new LedgerFacade(),
    new AgingEngineImpl(),
    new RiskScoringLayerImpl(),
    new InMemoryStateRepository(),
    new CollectionsStateMachine(),
    eventBus
  );

  // Act: Trigger flow
  await orchestrator.processCustomer("CUST-EXT-001");

  // Assert: Did the Audit/Notify pick it up?
  if (audit.getHistory().length === 0) throw new Error("Audit failed");
  
  console.log("✔ SIDE-EFFECT FLOW VERIFIED");
}

runTest().catch((err) => { console.error(err); Deno.exit(1); });
