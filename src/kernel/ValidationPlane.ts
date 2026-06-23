import { CanonicalEvent } from "@genesis/algebra/events";
import { CausalGraph } from "@genesis/algebra/CausalGraph";
export class ValidationPlane {
  validate(event: CanonicalEvent, graph: CausalGraph): boolean {
    for (const pid of event.parentIds) { if (!graph.get(pid)) return false; }
    return event.hash.length > 0;
  }
}
