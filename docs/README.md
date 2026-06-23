# GFOS Core — Documentation Index

This is the canonical entry point for all documentation in this repository.
Pick the document that matches what you need; if you're new, start with
[ARCHITECTURE.md](./ARCHITECTURE.md) and [PROJECT_STATUS.md](../PROJECT_STATUS.md).

---

## 1. Getting started

| Document | Purpose |
| :--- | :--- |
| [../README.md](../README.md) | Project overview, quick start, scripts index |
| [../PROJECT_STATUS.md](../PROJECT_STATUS.md) | Release status, completed work, next milestones |
| [../CHANGELOG.md](../CHANGELOG.md) | Versioned release notes |
| [../ARCHITECTURE.md](../ARCHITECTURE.md) | One-page architecture summary (Deno + Fastify + Postgres) |
| [../GFOS_Kernel_Engineering_Manifest.md](../GFOS_Kernel_Engineering_Manifest.md) | Formal correctness properties of the kernel |

## 2. Architecture & domain

| Document | Purpose |
| :--- | :--- |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Layered architecture, lifecycle, money model, events |
| [ARCHITECTURE_CONSTITUTION.md](./ARCHITECTURE_CONSTITUTION.md) | The architectural invariants every change must respect |
| [DOMAIN_BOUNDARIES.md](./DOMAIN_BOUNDARIES.md) | Bounded contexts, aggregates, anti-corruption layers |
| [architecture/SystemBlueprint.md](./architecture/SystemBlueprint.md) | High-level system diagram and runtime topology |
| [architecture/README.md](./architecture/README.md) | Architecture folder overview |
| [ADRs/ADR-001-postgresql-selection.md](./ADRs/ADR-001-postgresql-selection.md) | Why Postgres for the financial store |
| [architecture/decisions/ADR-001-Formal-Logic.md](./architecture/decisions/ADR-001-Formal-Logic.md) | Why a formal-style kernel (model-checking, replay) |

## 3. Financial rules (the heart of the system)

| Document | Purpose |
| :--- | :--- |
| [LEDGER_RULES.md](./LEDGER_RULES.md) | Double-entry invariants and balancing rules |
| [POSTING_RULES.md](./POSTING_RULES.md) | How domain events become ledger postings |
| [GL_MAPPING_RULES.md](./GL_MAPPING_RULES.md) | Map event types → general-ledger accounts |
| [FINANCIAL_RULES_REGISTRY.md](./FINANCIAL_RULES_REGISTRY.md) | Versioned registry of every financial rule |
| [ACCOUNTING_TEMPLATES.md](./ACCOUNTING_TEMPLATES.md) | Reusable journal templates |
| [ACCOUNTING_EVENT_CATALOG.md](./ACCOUNTING_EVENT_CATALOG.md) | All accounting events (id, payload, posting) |
| [EVENT_CATALOG.md](./EVENT_CATALOG.md) | All domain events (id, payload, consumers) |
| [JOURNAL_TEMPLATE_CATALOG.md](./JOURNAL_TEMPLATE_CATALOG.md) | Catalog of approved journal templates |

## 4. API & errors

| Document | Purpose |
| :--- | :--- |
| [api/spec/openapi.yaml](./api/spec/openapi.yaml) | OpenAPI 3 spec (HTTP API surface) |
| [ERROR_CATALOG.md](./ERROR_CATALOG.md) | Canonical error codes and their semantics |

## 5. Operations

| Document | Purpose |
| :--- | :--- |
| [operations/IncidentResponse.md](./operations/IncidentResponse.md) | Runbook for production incidents |
| [handbook/MaintenanceGuide.md](./handbook/MaintenanceGuide.md) | Day-2 maintenance (upgrades, rotations, drift) |
| [scaling/AutoScalingPolicy.md](./scaling/AutoScalingPolicy.md) | Horizontal scaling rules and thresholds |
| [kpis/system-health.md](./kpis/system-health.md) | What we measure and what "healthy" means |

## 6. Compliance & quality

| Document | Purpose |
| :--- | :--- |
| [compliance/FinalValidationReport.md](./compliance/FinalValidationReport.md) | Final pre-launch compliance report |
| [scientific/MethodologySummary.md](./scientific/MethodologySummary.md) | Scientific method we apply to financial logic |

## 7. Closure & launch

| Document | Purpose |
| :--- | :--- |
| [final/SystemManifest.md](./final/SystemManifest.md) | What we ship at v1.0 |
| [final/ReadyToLaunch.json](./final/ReadyToLaunch.json) | Machine-readable launch-readiness checklist |
| [final/lifecycle/ProjectClosure.md](./final/lifecycle/ProjectClosure.md) | Project lifecycle definition |

---

## How to add a new document

1. Place it in the most specific subfolder (`operations/`, `architecture/`, etc.).
2. Add a row to the matching section above.
3. If it's a decision, also add a short ADR under `ADRs/`.
4. If it changes a financial rule, update `FINANCIAL_RULES_REGISTRY.md` first.
