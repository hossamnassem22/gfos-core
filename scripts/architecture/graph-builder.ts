import { GraphBuilder } from "./graph/graph.builder.ts";
import { ArchitectureGraph } from "./graph/graph.types.ts";

export function buildDependencyGraph(): ArchitectureGraph {
  const builder = new GraphBuilder();
  return builder.build();
}
