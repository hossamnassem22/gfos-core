export function validateEdges(edges: unknown) {
  if (!Array.isArray(edges)) {
    throw new Error(
      "Architecture Engine Contract Violation: edges must be an array"
    );
  }

  for (const e of edges) {
    if (!e.from || !e.to) {
      throw new Error("Invalid edge detected");
    }
  }

  return true;
}
