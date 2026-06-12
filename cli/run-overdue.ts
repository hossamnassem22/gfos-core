import { OverdueEngine } from "../src/application/services/OverdueEngine.ts";

const args = Deno.args;
const dryRun = args.includes("--dry-run");
const maxDaysLate = args.find(a => a.startsWith("--max-days-late="))?.split("=")[1];
const batchSize = args.find(a => a.startsWith("--batch-size="))?.split("=")[1];
const tenantId = args.find(a => a.startsWith("--tenant-id="))?.split("=")[1];

console.log(`▶ Starting Overdue Engine [DryRun: ${dryRun}]...`);

try {
  const result = await OverdueEngine.process({
    dryRun,
    maxDaysLate: maxDaysLate ? parseInt(maxDaysLate) : null,
    batchSize: batchSize ? parseInt(batchSize) : 100,
    tenantId,
  });

  console.log("-----------------------------------------");
  console.log("Execution Summary:");
  console.log(result);
  console.log("-----------------------------------------");
  
  Deno.exit(0);
} catch (error) {
  console.error("Execution failed:", error);
  Deno.exit(1);
}
