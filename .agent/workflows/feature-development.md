---
description: feature development
---

# Workflow: Feature Development

Read `AGENTS.md`, `docs/README.md`, the audit, the program board and the relevant architecture/contract documents before implementation.

## 1. Define the workstream

Record:

- workstream ID and objective;
- acceptance criteria and failure behaviour;
- apps/packages involved;
- paths owned and shared files requested;
- schema/API/auth/money/event/environment/localisation contracts affected;
- dependencies, fixtures and verification plan.

Use one branch/worktree for one primary workstream. Do not begin if another active workstream owns the required path.

## 2. Analyse existing behaviour

- Search all apps/packages for current implementations and consumers.
- Trace the complete request/data path, including auth, tenant scope, database, side effects and clients.
- Identify current invariants, compatibility requirements, mock/fallback data and operational dependencies.
- Research current official framework/provider guidance when behaviour may have changed.

## 3. Contract and test first

For shared or critical changes, define before implementation:

- request/response or domain interface;
- state transitions and stable error codes;
- database migration/constraint plan;
- idempotency and concurrency behaviour;
- fixtures/simulators for parallel consumers;
- positive, negative and recovery tests.

Critical bug fixes require a regression test that demonstrates the old failure.

## 4. Implement by layer

Preferred order:

1. backward-compatible schema/migration where needed;
2. shared domain policy/service;
3. external/mobile Route Handler or same-app Server Action;
4. web/partner/admin consumer;
5. Flutter repository/provider/view integration;
6. outbox/events/observability;
7. tests, documentation and cleanup.

Do not duplicate booking, pricing, commission, wallet, permission or state-transition logic in multiple applications.

## 5. Security and correctness review

Before calling the feature complete, verify:

- validation, authentication and tenant/role authorisation;
- server authority for money and state;
- transaction and database-level concurrency guarantees;
- idempotency/retry behaviour for providers and jobs;
- PII/secret-safe logging and errors;
- loading, empty, error and recovery states;
- accessibility, localisation and performance impact.

## 6. Checkpoints

At each coherent checkpoint:

- run the smallest relevant checks;
- commit with the workstream ID;
- push;
- update assumptions/dependencies on the program board.

Avoid mass formatting, broad redesign or unrelated dependency upgrades.

## 7. Final verification and handoff

Run all applicable commands from `AGENTS.md`, satisfy `docs/execution/04-definition-of-done.md`, update affected documentation/contracts and use the handoff template in `docs/execution/01-multi-agent-operating-model.md`.

Code existing on a branch is not `DONE`; merge/integration and runtime evidence are required.