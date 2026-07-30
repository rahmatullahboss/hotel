# ZinuRooms Documentation Index

This directory is the canonical system record. New agents must begin with `AGENTS.md`, then read the documents relevant to their assigned workstream.

## Current baseline

- Audit baseline date: **2026-07-30**
- Baseline branch: `main`
- Deployment posture: Vercel for the three Next.js applications, Neon PostgreSQL, Cloudflare Worker/Durable Objects for realtime, Firebase/FCM for mobile notifications, Stripe payment integration, Flutter mobile client.
- Current phase: development and stabilisation; not yet considered production-ready for unrestricted commercial traffic.

## Required reading by role

| Role/work | Required documents |
|---|---|
| Every agent | `AGENTS.md`, this index, audit, program board, definition of done |
| Web/customer/API | architecture, API/security sections of audit, test strategy |
| Partner/PMS | architecture, booking/inventory contracts, ownership matrix |
| Admin | architecture, RBAC/tenant rules, ownership matrix |
| Flutter | mobile architecture section, test strategy, API contracts |
| Database/money | audit P0 findings, change contracts, migration policy |
| CI/deployment | environments/deployment, test strategy, definition of done |

## Document map

### Audit

- [`audit/2026-07-30-static-system-audit.md`](audit/2026-07-30-static-system-audit.md) — evidence-based current-state audit, risk priorities and recommended sequence.

### Architecture

- [`architecture/01-system-context.md`](architecture/01-system-context.md) — applications, dependencies, trust boundaries and core domain flows.

### Execution and multi-agent coordination

- [`execution/01-multi-agent-operating-model.md`](execution/01-multi-agent-operating-model.md) — branch/worktree, claiming, checkpoints, reviews and handoffs.
- [`execution/02-workstreams-and-ownership.md`](execution/02-workstreams-and-ownership.md) — bounded workstreams and file ownership.
- [`execution/03-program-board.md`](execution/03-program-board.md) — prioritised actionable backlog and status board.
- [`execution/04-definition-of-done.md`](execution/04-definition-of-done.md) — mandatory completion gates.
- [`execution/05-change-and-integration-contracts.md`](execution/05-change-and-integration-contracts.md) — schema/API/event/state compatibility rules.

### Quality and operations

- [`quality/01-test-strategy.md`](quality/01-test-strategy.md) — test pyramid, critical scenarios and CI gates.
- [`operations/01-environments-and-deployment.md`](operations/01-environments-and-deployment.md) — local/preview/staging/production environments, Vercel baseline and portability.

## Source-of-truth rules

1. Code and committed migrations describe current behaviour.
2. `AGENTS.md` describes mandatory engineering behaviour.
3. Architecture and integration documents describe intended boundaries and invariants.
4. The program board describes planned work and ownership.
5. PRs update all affected documents in the same change.

When code and documentation disagree, do not silently choose one. Record the discrepancy, determine intended behaviour, then update both in one reviewed PR.

## Status language

Use only:

- `NOT_STARTED`
- `READY`
- `IN_PROGRESS`
- `BLOCKED`
- `IN_REVIEW`
- `DONE`
- `DEFERRED`

`DONE` requires the full definition of done, not merely code completion.