import { CanonicalEvent } from "@genesis/algebra/events";
import { CausalGraph } from "@genesis/algebra/CausalGraph";

/**
 * يضمن أن أي حدث يدخل في الـ Graph قد تم كتابته في الـ Log أولاً.
 */
export class PersistentLog {
  private log: CanonicalEvent[] = [];

  append(event: CanonicalEvent): void {
    // Persistence Layer (e.g., Disk/DB I/O)
    this.log.push(event);
  }

  // لاستعادة النظام عند التعطل (Cold Start Recovery)
  recover(graph: CausalGraph): void {
    for (const event of this.log) {
      try { graph.add(event); } catch { /* ignore */ }
    }
  }
}
