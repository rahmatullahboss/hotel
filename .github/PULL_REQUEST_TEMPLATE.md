## Workstream

- ID:
- Objective:
- Program board status:
- Base SHA:

## Result

Describe the behaviour changed and the guarantees now provided.

## Ownership and files

- Paths owned:
- Shared files changed and coordination approval:
- Unrelated existing work preserved:

## Contracts and compatibility

Check and describe every applicable item:

- [ ] API request/response/error contract
- [ ] Database schema/migration
- [ ] Auth/session/JWT/permission contract
- [ ] Booking/payment/wallet/inventory state
- [ ] Realtime/domain event
- [ ] Environment variable
- [ ] Localisation/design-system contract

Backward compatibility and deployment order:

## Security and correctness

- Validation/authentication/authorisation and tenant scope:
- Server-authoritative money/state checks:
- Transaction/concurrency/idempotency checks:
- PII/secret-safe logging and errors:
- Failure/recovery behaviour:

## Database and deployment

- Migration files/head:
- Empty-database and upgrade test:
- Backfill/rollback/forward-fix:
- Environment/deployment changes:

## Verification

List exact commands and results. Do not write only “tests pass”.

```text
command -> result
```

- [ ] Relevant lint
- [ ] Relevant type-check
- [ ] Relevant build
- [ ] Unit/domain tests
- [ ] Integration/contract tests
- [ ] Critical E2E/manual evidence with follow-up ID when temporarily manual
- [ ] No failing check is suppressed

## UI/product review

- [ ] Loading, empty, error and success states
- [ ] Responsive/accessibility review
- [ ] Localisation/content review
- [ ] No silent demo/fallback data presented as live

## Documentation and handoff

- [ ] Affected architecture/contract/runbook documentation updated
- [ ] Program board updated
- [ ] Known limitations and follow-up workstream IDs listed below

Known limitations/follow-ups:

## Final checklist

- [ ] I followed `AGENTS.md`.
- [ ] I satisfied the applicable `docs/execution/04-definition-of-done.md` gates.
- [ ] This PR is one coherent workstream and contains no broad unrelated rewrite.
- [ ] High-risk auth/database/money/reservation changes have an independent reviewer.