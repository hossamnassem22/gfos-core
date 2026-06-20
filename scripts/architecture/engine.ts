import { buildDependencyGraph } from "./graph-builder.ts";
import { validateEdges } from "./rules-engine.ts";

export async function runArchitectureEngine() {
  console.log("🧱 Running Architecture Engine (GRAPH MODE)");

  const graph = buildDependencyGraph();

  // ✅ ضمان صريح 100% أن edges Array
  const edges = Array.isArray(graph.edges) ? graph.edges : [];

  validateEdges(edges);

  console.log("✅ ARCHITECTURE CLEAN");
}

runArchitectureEngine();
