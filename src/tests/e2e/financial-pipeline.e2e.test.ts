import { LedgerFacade } from "../../accounting/LedgerFacade.ts";
import { AgingEngineImpl } from "../../accounting/aging/AgingEngine.ts";
import { RiskScoringLayerImpl } from "../../accounting/risk/RiskScoringLayer.ts";
import { CollectionsOrchestrator } from "../../collections/orchestration/CollectionsOrchestrator.ts";

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

async function runE2E() {
  console.log("--- Executing Pipeline Contract Enforcement Gate ---");

  const ledger = new LedgerFacade();
  const aging = new AgingEngineImpl();
  const risk = new RiskScoringLayerImpl();
  const orchestrator = new CollectionsOrchestrator(ledger, aging, risk);
  const customerId = "CUST_001";

  await ledger.postEntry({ customerId, date: daysAgo(95), amount: 20000, direction: "DEBIT", referenceId: "INV_1" });
  await ledger.postEntry({ customerId, date: daysAgo(40), amount: 8000, direction: "DEBIT", referenceId: "INV_2" });
  await ledger.postEntry({ customerId, date: daysAgo(10), amount: 5000, direction: "CREDIT", referenceId: "PAY_1" });

  const result = await orchestrator.processCustomer(customerId);

  console.log("Evaluation Result:", JSON.stringify(result, null, 2));

  const isD90Correct = result.profile.buckets.D90_PLUS === 20000;
  const isRiskCorrect = result.assessment.level === "CRITICAL";
  const isActionCorrect = result.assessment.recommendedAction === "ESCALATE";

  if (isD90Correct && isRiskCorrect && isActionCorrect) {
    console.log("✅ Pipeline Contract Gate Passed: Architecture is solid.");
  } else {
    console.error("❌ Pipeline Contract Gate Failed: Architectural mismatch detected.");
    throw new Error("Pipeline Gate Violation");
  }
}

runE2E().catch((err) => {
  console.error(err);
  Deno.exit(1);
});
