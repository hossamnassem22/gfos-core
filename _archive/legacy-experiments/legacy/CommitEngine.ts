import { CanonicalEvent } from "@genesis/algebra/events";
import { CausalGraph } from "@genesis/algebra/CausalGraph";
export type CommitSet = ReadonlySet<string>;
export class CommitEngine {
  static resolve(graph: CausalGraph): CommitSet {
    const committed = new Set<string>();
    let changed = true;
    while (changed) {
      changed = false;
      for (const event of graph.events()) {
        if (committed.has(event.id)) continue;
        if (event.parentIds.every(id => committed.has(id))) {
          committed.add(event.id);
          changed = true;
        }
      }
    }
    return committed;
  }
}
