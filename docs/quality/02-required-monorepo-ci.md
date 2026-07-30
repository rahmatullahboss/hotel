# Required Monorepo CI

Workstream: `CI-01`

This document defines the required GitHub checks for the Node/Next.js monorepo. Flutter release validation remains owned by `CI-02`.

## Workflow

File: `.github/workflows/monorepo-ci.yml`

Triggers:

- every pull request targeting `main`;
- every push to `main`;
- manual dispatch for recovery or configuration verification.

The workflow has least-privilege repository access (`contents: read`), cancels superseded runs on the same ref and applies explicit job timeouts. Official Node 24-based `actions/checkout@v5` and `actions/setup-node@v6` are used so the workflow does not depend on deprecated Node 20 action runtimes.

## Required checks

Configure branch protection/rulesets for `main` after the first successful pull-request run and require these exact checks:

1. `Monorepo CI / Lint, types and CI tests`
2. `Monorepo CI / Production build`

Do not enable a required check until its workflow name has appeared on an actual pull request; GitHub matches required checks by their reported names.

## Gates

### Lint, types and CI tests

Runs with the committed lockfile and declared Node/npm versions:

```bash
npm ci
npm run lint:ci
npm run check-types
npm run test:ci
```

### Changed-file lint ratchet

The repository contains pre-existing lint debt in the admin, partner and customer applications. Blocking CI on the complete historical warning set would turn `CI-01` into an unrelated broad refactor and encourage warning suppression.

Instead, `npm run lint:ci` applies a strict ratchet:

- resolves the pull-request base branch or previous push commit from Git history;
- finds added, copied, modified and renamed JavaScript/TypeScript source files;
- maps each file to its owning workspace;
- requires an ESLint flat config and `lint` script for that workspace;
- runs ESLint only on the changed source files with `--max-warnings 0`;
- fails when a changed source file is outside a configured workspace;
- never converts a lint failure into success.

This means new or modified code must be warning-free immediately, while existing untouched warning debt is frozen rather than silently accepted as a new standard.

The full inventory command remains:

```bash
npm run lint
```

`LINT-01` owns the measured removal of existing warnings until the full-repository command can replace the ratchet as the required gate. Warning counts may not be increased and broad rule disabling is prohibited.

`test:ci` currently protects the CI/workspace contract itself. Domain workstreams must add unit and integration tests for their changed behaviour; this command is the stable root entry point through which CI-level tests are expanded.

### Full type-check

`npm run check-types` remains a full-workspace gate rather than a changed-file ratchet. TypeScript contracts cross package and application boundaries, so a local change can break an untouched consumer.

### Production build

Runs:

```bash
npm ci
npm run build
```

The job requires the repository Actions secret `CI_DATABASE_URL`.

`CI_DATABASE_URL` must point to an isolated, non-production Neon branch with schema compatible with the pull request base. Never use the production database for pull-request builds. `DB-01` owns the long-term migration/bootstrap process for this branch.

The workflow supplies a CI-only Auth.js secret because compilation needs deterministic auth configuration. It is not a runtime or deployment credential.

## Secret setup

Repository administrator:

1. Create or choose an isolated Neon CI branch.
2. Add its pooled connection string as the Actions repository secret `CI_DATABASE_URL`.
3. Restrict database privileges to the minimum required for build-time reads.
4. Do not store the value in `.env.example`, workflow YAML, logs or pull-request comments.
5. Rotate the secret if it is exposed or if the CI branch is recreated.

A missing secret intentionally fails the production-build job with a configuration error. It must never cause the build to be skipped or reported successful.

## Local reproduction

From a clean checkout using Node 22 and npm 11.6.2:

```bash
npm ci
npm run lint:ci
npm run check-types
npm run test:ci
CI_DATABASE_URL='<isolated-neon-url>' DATABASE_URL="$CI_DATABASE_URL" npm run build
```

For a complete historical lint inventory, run separately:

```bash
npm run lint
```

For a single canonical command after exporting `DATABASE_URL`:

```bash
npm run verify:ci
```

## False-green policy

CI commands may not use:

- `continue-on-error: true`;
- `|| true` or failure-to-success echo fallbacks;
- `--if-present` for required scripts;
- conditional skipping when a required credential or service is absent;
- a global warning allowance that lets new warnings replace removed legacy warnings;
- broad disabling of lint rules to make a gate green.

An unavailable dependency is a failed or blocked check, not a passing check.

## Scope and follow-up

CI-01 establishes deterministic install, a zero-warning changed-file lint ratchet, full type-check, CI contract tests and full production build. It does not claim complete domain test coverage or historical lint cleanup.

Follow-up owners:

- `LINT-01`: remove the frozen historical lint debt and retire the ratchet;
- `CI-02`: strict Flutter format/analyse/test/build workflow;
- `DB-01`: repeatable CI database migration/bootstrap;
- `QA-01`: booking/payment/tenant integration and end-to-end suites;
- feature workstreams: unit/integration tests for changed behaviour.
