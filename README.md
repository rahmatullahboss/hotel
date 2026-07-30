# ZinuRooms

ZinuRooms is a hotel booking and property-operations platform with customer web/mobile booking, a hotel partner/PMS application and a platform administration application.

> Current phase: development and stabilisation. Read the audit before treating any module as production-ready.

## Applications

| Path | Application | Default local port |
|---|---|---:|
| `apps/web` | Customer booking website and customer/mobile APIs | 3000 |
| `apps/partner` | Hotel partner/PMS dashboard | 3001 |
| `apps/admin` | ZinuRooms platform administration | 3002 |
| `apps/mobile-flutter` | Active Flutter Android/iOS customer app | device/emulator |

Shared services/packages:

- `packages/db` — Neon PostgreSQL and Drizzle schema/migrations;
- `packages/api` — reusable server-side domain/API code;
- `packages/realtime` — Cloudflare Worker/Durable Object realtime service;
- `packages/ui` and config packages — shared UI/tooling.

The previous Expo mobile application/guidance is legacy. New mobile work belongs in `apps/mobile-flutter`.

## Technology baseline

- Next.js 16 / React 19 / TypeScript;
- Turborepo with npm workspaces;
- Neon PostgreSQL and Drizzle ORM;
- Auth.js/NextAuth for web sessions plus a custom mobile-token API that is scheduled for hardening;
- Flutter, Riverpod, go_router and Dio;
- Stripe payments;
- Firebase Cloud Messaging;
- Cloudflare Workers/Durable Objects for realtime;
- Vercel for the three Next.js applications during the current development phase.

## Start here

Every agent and contributor must read:

1. [`AGENTS.md`](AGENTS.md)
2. [`docs/README.md`](docs/README.md)
3. [`docs/audit/2026-07-30-static-system-audit.md`](docs/audit/2026-07-30-static-system-audit.md)
4. [`docs/execution/03-program-board.md`](docs/execution/03-program-board.md)
5. the documents relevant to the assigned workstream

Do not begin parallel implementation without claiming a workstream and paths on the program board.

## Requirements

- Node.js 22 or newer;
- npm version declared by the root `packageManager`;
- Flutter/Dart versions compatible with `apps/mobile-flutter/pubspec.yaml`;
- PostgreSQL/Neon development database;
- required local environment variables.

## Environment

Copy the example and configure local-only values:

```bash
cp .env.example .env
```

The current `.env.example` is being expanded under `OPS-01`. Never commit real secrets. Preview/staging/production must use separate credentials and databases where appropriate.

Database connections should eventually be split into:

- pooled application connection;
- direct migration/administrative connection.

## Install

```bash
npm install
```

## Development

Run all Next.js applications/packages:

```bash
npm run dev
```

Run one application:

```bash
npm run dev:web
npm run dev:partner
npm run dev:admin
```

Flutter:

```bash
cd apps/mobile-flutter
flutter pub get
flutter run
```

## Verification

Current baseline commands:

```bash
npm run lint
npm run check-types
npm run build
```

Flutter:

```bash
cd apps/mobile-flutter
dart format --output=none --set-exit-if-changed .
flutter analyze
flutter test
```

The repository audit found that automated tests and CI gates are incomplete. Passing a build alone does not establish booking, payment, authorisation or concurrency correctness. Follow [`docs/quality/01-test-strategy.md`](docs/quality/01-test-strategy.md).

## Database changes

Schema source:

```text
packages/db/src/schema/
```

Required shared-environment workflow:

1. edit schema;
2. generate a named SQL migration;
3. review the SQL;
4. apply with Drizzle migration tooling using a direct database connection;
5. test empty-database and upgrade paths;
6. update affected contracts/tests/docs.

`db:push` is only for disposable local prototyping. It must not be used against shared staging or production.

## Deployment

Current baseline:

- customer web, partner and admin: Vercel;
- database: Neon;
- realtime: Cloudflare;
- mobile release: GitHub Actions/Flutter tooling.

Vercel remains suitable while the product is under development and traffic is low. The Next.js stack is portable; see [`docs/operations/01-environments-and-deployment.md`](docs/operations/01-environments-and-deployment.md) for the future Docker/VPS path.

## High-priority stabilisation work

The current P0 queue includes:

- mobile JWT secret/token hardening;
- server-authoritative booking and payment amounts;
- Stripe idempotency and signed webhook reconciliation;
- database-enforced reservation concurrency;
- consistent commission/booking-fee policy;
- cron endpoints that fail closed;
- strict web and Flutter CI without failure suppression;
- critical integration/end-to-end tests.

The source of truth is the [program board](docs/execution/03-program-board.md).

## Contribution and PR expectations

- one workstream per branch;
- minimal, coherent commits;
- no resetting or overwriting unknown work;
- tests and documentation in the same PR;
- explicit schema/API/event/environment impact;
- exact verification results;
- security, tenant, money and concurrency review where applicable;
- program board update before completion.

Use the handoff template in [`docs/execution/01-multi-agent-operating-model.md`](docs/execution/01-multi-agent-operating-model.md).