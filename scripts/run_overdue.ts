import { OverdueEngine } from "../src/application/services/OverdueEngine.ts";

console.log("--- Starting Production Overdue Engine Run ---");

try {
  const result = await OverdueEngine.process({
    dryRun: false,
    batchSize: 100
  });

  console.log("Success! Engine result:", result);
} catch (error) {
  console.error("Critical Failure in Overdue Engine:", error);
  Deno.exit(1);
}
