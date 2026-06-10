import { OverdueEngine } from "../src/application/services/OverdueEngine.ts";

console.log("--- Executing Overdue Engine (Production Mode) ---");

const result = await OverdueEngine.process({ dryRun: false, batchSize: 10 });

console.log("Processing finished:", result);
