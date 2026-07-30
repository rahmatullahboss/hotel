# Definition of Done

A work item is not complete because code exists or a page renders. Every applicable gate below must pass.

## 1. Scope and acceptance

- [ ] Workstream ID, objective and acceptance criteria are documented.
- [ ] Changes remain within claimed ownership or shared-file approval is recorded.
- [ ] No unrelated refactor, dependency upgrade or mass formatting is included.
- [ ] User-visible behaviour and failure behaviour match the acceptance criteria.

## 2. Architecture and contracts

- [ ] Existing domain service/contract was reused or a justified new boundary was documented.
- [ ] API/schema/event/status/environment changes are listed.
- [ ] Backward compatibility or version migration is addressed.
- [ ] Web, partner, admin and mobile consumers affected by the contract are identified.
- [ ] Documentation reflects implemented behaviour.

## 3. Security and privacy

- [ ] Input is validated at the server boundary.
- [ ] Authentication is required and fails closed.
- [ ] Authorisation and hotel/tenant scope are enforced server-side.
- [ ] Negative access tests exist.
- [ ] Secrets have no fallback and are not logged/committed.
- [ ] Logs/errors do not expose tokens, passwords, payment data or unnecessary guest PII.
- [ ] Upload/webhook/cron/realtime entry points have explicit trust validation.
- [ ] Rate limiting/abuse considerations are addressed for public endpoints.

## 4. Money, booking and concurrency

Applicable to pricing, booking, wallet, commission, payout, refund or payment changes:

- [ ] Authoritative values are calculated on the server.
- [ ] Exact money representation and rounding are defined.
- [ ] Operation is idempotent where retries are possible.
- [ ] Transaction boundaries are explicit.
- [ ] Concurrent update/double-booking/overspend behaviour is tested.
- [ ] Ledger/audit records are immutable or corrected by reversal.
- [ ] State transitions are legal and auditable.
- [ ] Provider reconciliation and recovery path are documented.

## 5. Database

- [ ] Schema change has a named committed migration.
- [ ] Generated SQL was reviewed.
- [ ] Constraints, foreign keys, indexes and delete behaviour were reviewed.
- [ ] Existing-data backfill/compatibility is handled.
- [ ] Empty-database migration test passes.
- [ ] Upgrade-from-current-baseline test passes.
- [ ] Direct migration connection is used; shared environment did not use `db:push`.
- [ ] Rollback or forward-fix plan is written.

## 6. Tests

- [ ] Unit tests cover new/changed domain logic.
- [ ] Integration tests cover database/API/provider boundary where applicable.
- [ ] Regression test fails before the bug fix and passes after it.
- [ ] Critical flow has E2E coverage or a documented temporary manual test with follow-up ID.
- [ ] No failure is suppressed with `|| true`, `continue-on-error`, ignored exit codes or equivalent.
- [ ] Test data is isolated and repeatable.

## 7. Required commands

For TypeScript/Next.js changes, record results of applicable commands:

```bash
npm run lint
npm run check-types
npm run build
# plus workstream tests
```

For Flutter changes:

```bash
cd apps/mobile-flutter
dart format --output=none --set-exit-if-changed .
flutter analyze
flutter test
# required platform build where applicable
```

For migration changes, record generate/migrate and verification commands.

## 8. Reliability and operations

- [ ] Errors are explicit, recoverable and observable.
- [ ] External side effects have timeout/retry/idempotency policy.
- [ ] Health/readiness and deployment impact are addressed.
- [ ] New environment variables are added to registry/example and deployment environments.
- [ ] Metrics/alerts/runbook changes are documented for critical paths.
- [ ] Rollout, rollback and data recovery steps are included.

## 9. UI and product quality

- [ ] Loading, empty, success and error states exist.
- [ ] Responsive behaviour was checked.
- [ ] Keyboard/accessibility labels and contrast were reviewed.
- [ ] User-visible text is localised where required.
- [ ] No false/demo fallback is silently presented as live data.
- [ ] Performance impact and unnecessary client JavaScript were considered.

## 10. Git and handoff

- [ ] Commits are coherent and descriptive.
- [ ] Branch is pushed and based on approved SHA.
- [ ] PR links workstream and includes files/contracts/migrations/env changes.
- [ ] Exact test/build results are included.
- [ ] Known limitations and follow-up IDs are included.
- [ ] Program board is updated.
- [ ] Reviewer approval is obtained for high-risk domain/security/database work.
- [ ] Merged/integration SHA is recorded before status becomes `DONE`.

## 11. Release-level done

A release additionally requires:

- [ ] all release-blocking workstreams are `DONE`;
- [ ] migration backup and restore plan confirmed;
- [ ] staging smoke and critical E2E pass;
- [ ] Stripe/provider test-mode reconciliation pass;
- [ ] web, partner, admin and mobile version compatibility confirmed;
- [ ] monitoring/alerts checked;
- [ ] release notes, known issues and rollback owner published.