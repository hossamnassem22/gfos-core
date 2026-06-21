import { CausalGraph } from "@genesis/algebra/CausalGraph";
import { EventId } from "@genesis/algebra/events";
export class CausalFrontier {
  static compute(graph: CausalGraph): Set<EventId> {
    const all = Array.from(graph.events());
    const frontier = new Set(all.map(e => e.id));
    for (const e of all) { for (const pid of e.parentIds) { frontier.delete(pid); } }
    return frontier;
  }
}
