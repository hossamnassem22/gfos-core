import type { Edge } from "./graph-builder.ts";

export function detectCycles(edges: Edge[]) {
  const graph = new Map<string, string[]>();

  for (const e of edges) {
    if (!graph.has(e.from)) graph.set(e.from, []);
    graph.get(e.from)!.push(e.to);
  }

  const visited = new Set<string>();
  const stack = new Set<string>();
  const cycles: string[][] = [];

  function dfs(node: string, path: string[]) {
    if (stack.has(node)) {
      cycles.push([...path, node]);
      return;
    }

    if (visited.has(node)) return;

    visited.add(node);
    stack.add(node);

    for (const n of graph.get(node) || []) {
      dfs(n, [...path, node]);
    }

    stack.delete(node);
  }

  for (const node of graph.keys()) {
    dfs(node, []);
  }

  return cycles;
}
