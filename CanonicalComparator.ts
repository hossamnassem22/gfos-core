import { CanonicalEvent } from "./CanonicalEvent.ts";
export class CanonicalComparator {
  static compare(a: CanonicalEvent, b: CanonicalEvent): number {
    if (a.sequenceHint < b.sequenceHint) return -1;
    if (a.sequenceHint > b.sequenceHint) return 1;
    if (a.hash < b.hash) return -1;
    if (a.hash > b.hash) return 1;
    if (a.id < b.id) return -1;
    if (a.id > b.id) return 1;
    return 0;
  }
}
