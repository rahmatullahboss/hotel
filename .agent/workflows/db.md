---
description: database migration
---

# Workflow: Database Change

Read `AGENTS.md`, the audit, the program board and `docs/execution/05-change-and-integration-contracts.md` first.

## 1. Coordinate ownership

- Claim the database workstream or obtain approval from `DB-01`.
- Confirm the current migration head and whether another active agent is touching the same tables.
- Record affected tables, consumers, backfill and compatibility strategy before editing.

## 2. Design the change

Review:

- nullability/defaults for existing rows;
- foreign keys and delete behaviour;
- uniqueness, check and concurrency constraints;
- indexes and expected query patterns;
- money unit/currency/rounding where applicable;
- tenant boundaries and audit/event requirements;
- expand/migrate/contract rollout for breaking changes.

Prefer additive, backward-compatible changes during parallel work.

## 3. Edit schema and generate migration

- Modify the appropriate file under `packages/db/src/schema/`.
- Update exports only when necessary and coordinate changes to shared index files.
- Generate a named migration using the repository's Drizzle generate command.
- Inspect the generated SQL manually. Do not accept destructive or incorrect SQL blindly.
- Manually authored SQL is allowed when a generated migration cannot express a required PostgreSQL constraint, backfill or safe data transformation; explain why in the migration/PR.

## 4. Apply correctly

- Use a direct Neon/PostgreSQL connection such as `DATABASE_DIRECT_URL` for migrations.
- Use the pooled connection for application traffic.
- Apply committed migrations with Drizzle migration tooling.
- Never use `db:push` against shared preview, staging or production. It is restricted to disposable local experimentation.
- Do not let every application instance run migrations on startup.

## 5. Verify

Required evidence:

1. apply all migrations to an empty database;
2. apply the new migration to a copy/branch representing the current baseline;
3. run integrity/backfill assertions;
4. run affected domain/API tests;
5. run concurrency tests for booking, inventory, wallet or other contested data;
6. run lint, type-check and build for affected packages/apps;
7. inspect indexes/constraints and relevant query plans where performance-sensitive.

## 6. Rollout and recovery

Document:

- deployment order;
- whether old and new application versions can run during rollout;
- backfill command and idempotency;
- rollback feasibility or forward-fix plan;
- backup/restore requirement;
- when compatibility columns/code may be removed.

## 7. Handoff

Include migration files, generated SQL summary, commands/results, affected contracts, data risk and final migration head in the PR and program board update.