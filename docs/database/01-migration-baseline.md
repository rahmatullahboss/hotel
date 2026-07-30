# Database Migration Baseline and Existing-Environment Adoption

Workstream: `DB-01`

Baseline date: 2026-07-30

## 1. Scope

This document establishes the canonical database-change process for ZinuRooms. It covers:

- committed Drizzle SQL migrations and snapshots;
- pooled runtime connections versus direct migration connections;
- clean-database and repeatability verification;
- development-only schema push restrictions;
- controlled adoption for an existing database whose schema already exists but whose Drizzle migration log is absent;
- rollback, backup and handoff requirements.

It does not authorise an automatic production migration or migration-log adoption.

## 2. Current baseline

The repository already contains a valid Drizzle migration history under `packages/db/drizzle`.

At this baseline:

- `_journal.json` contains 19 contiguous PostgreSQL migration entries;
- the entries run from index `0` through `18`;
- every journal entry has a committed SQL file;
- every journal entry has a committed snapshot;
- TypeScript schema, migration snapshots and SQL history are treated as one reviewed contract.

Do not regenerate or replace the historical migrations merely to rename them. Existing SQL files are immutable after they have been applied or adopted by a shared environment.

## 3. Connection separation

### Application traffic

Application processes use:

```text
DATABASE_URL
```

For Neon-hosted environments this should be the pooled connection string. Serverless and horizontally scaled application traffic must not consume direct database connections unnecessarily.

### Migration and administration traffic

Drizzle migration tooling uses:

```text
DATABASE_DIRECT_URL
```

This must be the direct, non-pooled connection for the same database and branch. `packages/db/drizzle.config.ts` fails before a migration command when this variable is absent.

Never silently fall back from `DATABASE_DIRECT_URL` to `DATABASE_URL` in migration tooling. A configuration mistake must fail closed.

## 4. Canonical commands

From the repository root:

```bash
npm run db:check
npm run db:generate
npm run db:migrate
npm run db:adoption-manifest
npm run db:studio
```

### Generate a migration

After changing `packages/db/src/schema`:

```bash
DATABASE_DIRECT_URL='<direct-branch-url>' npm run db:generate
```

Review all generated files:

- SQL statements;
- destructive operations;
- indexes and constraints;
- data backfill requirements;
- snapshot changes;
- migration ordering and branch conflicts.

Generation is not completion. A schema change requires migration verification, compatibility notes and application tests.

### Apply committed migrations

```bash
DATABASE_DIRECT_URL='<direct-branch-url>' npm run db:migrate
```

Shared preview, staging and production environments use committed migrations only.

### Validate migration history

```bash
DATABASE_DIRECT_URL='<direct-branch-url>' npm run db:check
```

`db:check` validates Drizzle migration metadata. The repository CI additionally verifies journal continuity, SQL/snapshot completeness, schema drift and clean application.

## 5. Schema push policy

There is no general `db:push` command.

A local-only command exists for disposable developer databases:

```bash
APP_ENV=local \
ALLOW_DB_PUSH=I_UNDERSTAND_LOCAL_ONLY \
DATABASE_DIRECT_URL='postgresql://...@localhost:5432/...' \
npm run db:push:local
```

The guard rejects:

- missing explicit confirmation;
- non-local environment names;
- non-local database hosts;
- shared Neon, preview, staging or production hosts.

Do not weaken or bypass this guard. If a disposable remote branch needs schema creation, use committed migrations.

## 6. Required CI evidence

Workflow: `.github/workflows/database-migrations.yml`

Required check:

```text
Database Migrations / Clean install and repeatability
```

The workflow starts an empty PostgreSQL 17 database and proves:

1. locked dependency installation succeeds;
2. Drizzle migration metadata is valid;
3. migration governance tests pass;
4. the database package type-checks;
5. generating from the current schema produces no migration drift;
6. all committed migrations apply to an empty database;
7. core tables exist after migration;
8. every applied migration has the exact journal timestamp and SHA-256 hash derived from its committed SQL file;
9. running migrations a second time is a no-op.

No required step may use `continue-on-error`, failure-to-success shell fallbacks or conditional success when verification is unavailable.

## 7. Adoption manifest

The read-only command:

```bash
npm run db:adoption-manifest
```

prints, for every committed migration:

- journal index;
- journal timestamp;
- SHA-256 hash of the complete SQL file;
- migration tag.

JSON output:

```bash
npm run db:adoption-manifest -- --json
```

The command does not connect to or mutate any database. Its output is useful only after the migration CI has proven that Drizzle writes the same timestamp/hash pairs to a clean database.

Do not commit generated manifests as a second source of truth. The journal and SQL files remain authoritative.

## 8. Existing production environment status

A read-only audit on 2026-07-30 found that the current hotel database contains the application schema but does not contain `drizzle.__drizzle_migrations`.

Consequences:

- running `db:migrate` directly against that database would make Drizzle treat historical migrations as unapplied;
- historical create/alter statements may collide with existing objects;
- no agent may run migrations against that environment until adoption is reviewed and approved;
- absence of the migration table is an operational blocker, not permission to recreate or drop the schema.

## 9. Controlled adoption procedure

Existing-environment adoption is a one-time, high-risk operation. It requires a dedicated work item, reviewed evidence and an approved maintenance plan.

### Phase A — prove repository history

1. Merge a green `Database Migrations / Clean install and repeatability` workflow.
2. Record the workflow run, commit SHA and migration count.
3. Save the generated adoption manifest as review evidence, not as a secret or database command.
4. Confirm that every future schema change starts after the last committed journal entry.

### Phase B — compare an isolated copy

1. Create a new Neon branch from the existing environment.
2. Record project, parent branch, child branch and creation timestamp.
3. Do not use the production branch for experiments.
4. Create a separate empty comparison database/branch and apply all committed migrations to it.
5. Compare schemas using catalog-level evidence, including:
   - schemas and tables;
   - columns, types, nullability and defaults;
   - primary, unique, foreign-key and check constraints;
   - indexes and exclusion constraints;
   - enums, sequences and extensions;
   - views, triggers and functions if present.
6. Classify every difference as:
   - expected environment metadata;
   - missing migration;
   - production-only drift;
   - destructive incompatibility.
7. Resolve schema drift through a reviewed forward migration or an explicit data-repair plan. Never edit historical SQL to make the comparison pass.

### Phase C — backup and approval

Before adoption:

- create and verify a restorable backup or protected Neon branch;
- record RPO/RTO and rollback owner;
- confirm application write freeze or maintenance-window requirements;
- verify no schema migration is running concurrently;
- obtain reviewer approval for the exact migration manifest and SQL used to initialise the migration log.

### Phase D — initialise migration history

Only after the isolated comparison establishes semantic schema equivalence may a separately reviewed operation create the Drizzle migration schema/table and record the proven timestamp/hash pairs as already applied.

Rules:

- the operation must be transactional where supported;
- it must fail if the migration table already exists or contains unexpected rows;
- it must verify the target database/branch identity before writing;
- it must verify required schema objects before writing;
- it must insert only the manifest proven by CI;
- it must not execute historical application DDL against the existing schema;
- it must emit an evidence report without exposing credentials.

DB-01 deliberately does not include an automatic production-adoption command. The final mutation must be prepared and reviewed after the clean-migration and isolated-schema-comparison evidence exists.

### Phase E — post-adoption verification

1. Run `db:migrate`; it must be a no-op.
2. Verify the migration count and timestamp/hash sequence.
3. Run application health and critical booking/auth/payment smoke tests.
4. Confirm no schema drift or unexpected locks/errors.
5. Record the evidence in the adoption PR/incident-style change record.
6. Retain rollback resources until the agreed observation period ends.

## 10. Rollback policy

Generated Drizzle migrations are forward migrations. Do not assume an automatic down migration exists.

Every database PR must document one of:

- forward correction migration;
- backward-compatible application rollback while keeping schema additions;
- data restore/branch rollback;
- maintenance operation with explicit reversal SQL.

For destructive changes:

1. deploy compatibility code first;
2. backfill and verify data;
3. stop reads/writes to the old shape;
4. remove old structures only in a later migration;
5. retain recovery evidence.

## 11. Multi-agent ownership

- `DB-01` owns migration configuration and baseline adoption rules.
- One active workstream owns the next migration index at a time.
- `PAY-01` and `RSV-01` must coordinate migrations through the database owner.
- Agents may not generate migrations concurrently from the same journal head without explicit coordination.
- Shared schema exports, journal, snapshots and SQL files require board ownership before modification.
- A migration PR must include generated files, commands/results, data plan, compatibility impact and rollback notes.

## 12. Definition of done for DB-01

DB-01 is complete only when:

- migration-first commands are committed;
- shared `db:push` is unavailable;
- direct and pooled URL responsibilities are documented and enforced;
- existing migration history passes metadata checks;
- clean PostgreSQL migration succeeds;
- hash/timestamp log equality is proven;
- second migration run is a no-op;
- production absence of migration history is documented as a controlled adoption blocker;
- no live production schema or migration log was modified by this workstream.
