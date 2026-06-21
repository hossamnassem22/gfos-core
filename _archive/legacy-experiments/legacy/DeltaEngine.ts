import { CausalGraph } from "@genesis/algebra/CausalGraph";
import { CanonicalEvent } from "@genesis/algebra/events";
import { CausalFrontier } from "./CausalFrontier";
export class DeltaEngine {
  static computeDelta(local: CausalGraph, remoteIds: Set<string>): CanonicalEvent[] {
    const delta: CanonicalEvent[] = [];
    const visited = new Set<string>();
    const queue = Array.from(CausalFrontier.compute(local));
    while (queue.length > 0) {
      const id = queue.shift()!;
      if (visited.has(id) || remoteIds.has(id)) continue;
      const event = local.get(id);
      if (event) {
        delta.push(event);
        visited.add(id);
        queue.push(...event.parentIds);
      }
    }
    return delta.reverse();
  }
}
