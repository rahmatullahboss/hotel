# Multi-Agent Operating Model

## 1. Objective

Allow multiple agents to work concurrently without duplicate implementation, conflicting migrations, accidental overwrites or undocumented contract changes.

## 2. Roles

### Program coordinator

Owns:

- program board and dependency order;
- workstream activation;
- shared-contract decisions;
- integration sequencing;
- resolving ownership conflicts;
- confirming release readiness.

The coordinator should not implement every module. It controls interfaces and integration.

### Workstream agent

Owns one bounded objective and its permitted paths. It updates tests and documentation with the implementation.

### Reviewer/integrator

Reviews behaviour, security, tenant boundaries, money/concurrency, migrations and compatibility. It merges in the approved order and runs integration gates.

An implementation agent must not self-approve a high-risk payment, auth, database or reservation change.

## 3. Workstream lifecycle

```text
NOT_STARTED -> READY -> IN_PROGRESS -> IN_REVIEW -> DONE
                       \-> BLOCKED
                       \-> DEFERRED
```

### READY requirements

- objective and acceptance criteria exist;
- dependencies are complete or simulated by an approved contract;
- ownership paths are listed;
- required environment/test data are available;
- shared contract changes are declared.

### IN_PROGRESS requirements

The agent records branch, base SHA, intended files and current checkpoint on the board.

### IN_REVIEW requirements

- code and docs pushed;
- PR opened;
- verification evidence attached;
- migration/contract/security impact stated;
- no unresolved merge conflict with another active stream.

### DONE requirements

The full definition of done passes and the coordinator updates the board after merge/integration evidence.

## 4. Branch and worktree protocol

- Start from the coordinator-approved integration/base SHA.
- Branch: `work/<ID>-<short-description>`.
- Recommended worktree: `.worktrees/<ID>-<short-description>`.
- Never reuse another agent's worktree.
- Never reset, clean or checkout over unknown dirty work.
- Rebase/merge the approved base before final review when requested by the integrator.

## 5. Claim protocol

Before implementation, add or update the board entry with:

```text
ID:
Agent/owner:
Branch:
Base SHA:
Paths owned:
Shared files requested:
Contracts affected:
Dependencies:
Verification plan:
```

If two agents need the same shared file, the coordinator assigns one writer. The other agent provides a patch proposal or waits for the shared contract commit.

## 6. Checkpoint protocol

Create coherent checkpoints rather than one large final commit.

Recommended sequence:

1. contract/test fixture;
2. database/domain implementation;
3. API integration;
4. web/partner/admin/mobile UI;
5. tests and docs;
6. cleanup and final evidence.

At each checkpoint:

- run relevant fast checks;
- commit with the workstream ID;
- push the branch;
- update the board note if assumptions or dependencies changed.

## 7. Shared contract protocol

The following require explicit coordination:

- Drizzle schema and migration files;
- root/package manifests and lockfiles;
- auth/session/JWT payloads;
- booking/payment/wallet status enums;
- API request/response types;
- realtime/domain event payloads;
- localisation keys;
- environment variable names;
- shared design tokens/components.

For a shared contract change, the owner first commits:

1. documented interface;
2. migration/compatibility strategy;
3. fixtures or simulator;
4. tests for old and new consumers where required.

Dependent agents implement against that reviewed contract, not against unmerged internal code.

## 8. Database coordination

Only one active workstream should generate migrations touching the same tables.

Database agent checklist:

- confirm current migration head;
- modify schema;
- generate named migration;
- inspect SQL manually;
- include constraints/indexes/backfill;
- test empty-database and upgrade paths;
- use direct database connection for migration;
- document rollback/forward-fix strategy;
- never run `db:push` on shared staging/production.

## 9. Review order

Review high-risk changes in this order:

1. schema and invariants;
2. auth/authorisation;
3. money and concurrency;
4. domain/API behaviour;
5. client integration;
6. observability and recovery;
7. UI/accessibility/performance.

UI review never substitutes for domain review.

## 10. Integration order

Default integration sequence:

1. shared contracts/migrations;
2. domain services;
3. external/mobile APIs;
4. partner/admin/customer consumers;
5. Flutter consumers;
6. E2E tests and deployment configuration.

The coordinator may change this only when backward-compatible adapters/fixtures isolate dependencies.

## 11. Conflict avoidance

- Do not mass-format the repository.
- Do not rename/move unrelated files.
- Do not regenerate all localisation or lockfiles unless required.
- Keep shared-file diffs minimal.
- Do not combine dependency upgrades with product changes.
- Avoid broad CSS rewrites in feature PRs.
- Prefer additive APIs and migrations during parallel work.

## 12. Handoff template

```md
## Workstream
ID and objective

## Result
What changed and what behaviour is now guaranteed

## Files
Owned/shared files modified

## Contracts
API/schema/event/env/status changes

## Verification
Commands and exact pass/fail result

## Security and correctness
Auth, tenant, money, concurrency and error paths checked

## Migration/deployment
Steps, ordering, rollback/forward-fix

## Known limitations
Open risks and follow-up IDs

## Git
Base SHA, final SHA, branch and PR
```

## 13. Stop conditions

An agent stops implementation and marks `BLOCKED` when:

- another active stream owns the required path;
- required contract is unspecified;
- a migration head conflict exists;
- tests reveal a pre-existing P0 issue that makes the change unsafe;
- production credentials/data would be needed in an unsafe way;
- requested behaviour conflicts with documented financial/security invariants.

The blocker must include a concrete resolution proposal.