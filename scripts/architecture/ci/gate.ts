import { DependencyGraph } from "../graph-builder.ts";
import { RulesEngine } from "../rules/rules.engine.ts";

const graph = new DependencyGraph();
const engine = new RulesEngine();

const edges = graph.getEdges();
const violations = engine.validate(edges);

console.log("🧱 Architecture Gate");

if (violations.length > 0) {
  console.log("\n🚨 Violations:");
  for (const v of violations) {
    console.log(`[${v.rule}] ${v.from} → ${v.to}`);
  }

  console.log("\n❌ BUILD FAILED");
  Deno.exit(1);
}

console.log("✅ CLEAN ARCHITECTURE");
