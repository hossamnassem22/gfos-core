import { CollectionsOrchestrator } from "../../collections/orchestration/CollectionsOrchestrator.ts";
import { InMemoryStateRepository } from "../../collections/state/InMemoryStateRepository.ts";
import { CollectionsStateMachine } from "../../collections/state/StateMachine.ts";
import { LedgerFacade } from "../../accounting/LedgerFacade.ts";
import { AgingEngineImpl } from "../../accounting/aging/AgingEngine.ts";
import { RiskScoringLayerImpl } from "../../accounting/risk/RiskScoringLayer.ts";

async function runTest() {
  const ledger = new LedgerFacade();
  const customerId = "CUST-001";

  // إدخال مديونية حرجة (أكبر من 20,000 لتفعيل ESCALATE)
  await ledger.postEntry({ 
    customerId, 
    date: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), 
    amount: 30000, 
    direction: "DEBIT", 
    referenceId: "INV_CRITICAL" 
  });

  const stateRepo = new InMemoryStateRepository();
  const orchestrator = new CollectionsOrchestrator(
    ledger,
    new AgingEngineImpl(),
    new RiskScoringLayerImpl(),
    stateRepo,
    new CollectionsStateMachine()
  );

  // Initial State
  await stateRepo.save({ customerId, state: "PENDING", updatedAt: new Date(), version: 1 });

  // Act
  await orchestrator.processCustomer(customerId);

  // Assert
  const finalState = await stateRepo.get(customerId);
  console.log("FINAL STATE:", finalState?.state);

  if (finalState?.state === "ESCALATED") {
    console.log("TEST PASSED ✔");
  } else {
    throw new Error("Test Failed: Expected ESCALATED state");
  }
}

runTest().catch((err) => {
  console.error(err);
  Deno.exit(1);
});
