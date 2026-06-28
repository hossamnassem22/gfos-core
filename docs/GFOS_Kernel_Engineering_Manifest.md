# GFOS Kernel v1.0 - Engineering Manifest

## 1. Scope Boundary (Exclusions)
- **Business Semantics:** The kernel does not define pricing, risk policies, or business logic. It strictly enforces financial integrity.
- **External Compliance:** Regulatory reporting logic resides in the Projection Layer, not the Kernel.

## 2. External Assumptions Contract
- **Persistence:** Assume the underlying event store is immutable, durable, and append-safe.
- **Crypto:** Hash function is collision-resistant (modeled as an abstract, pure function).
- **Network:** The causality order is established by the event log, rendering network timing irrelevant.
- **Clock:** No reliance on wall-clock time for state transition logic.

## 3. Proof Traceability Index
| Property | Formal Objective | Proof Basis |
| :--- | :--- | :--- |
| **Safety** | Financial Integrity | Invariant Preservation |
| **Liveness** | Commit Progress | Fairness Axioms (WF) |
| **Determinism** | Unique Outcome | Scheduler Uniqueness |
| **Causality** | DAG Integrity | Causal Closure Invariant |
| **Auditability** | Replay Equivalence | Behavioral Equivalence |
| **Certification** | Correctness Guarantee | Model Checking Success |

---
*Certified Formal Oracle - System Log Closed.*
