# Environments and Deployment

## 1. Current strategy

Keep Vercel during development and early low traffic. The immediate priority is correctness and testability, not a hosting rewrite.

Current logical services:

- `web` — customer site and mobile/external APIs;
- `partner` — hotel/PMS application;
- `admin` — platform administration;
- Neon PostgreSQL;
- Cloudflare realtime Worker/Durable Objects;
- Stripe/Firebase/object storage integrations;
- Flutter release artefacts.

## 2. Environment model

| Environment | Purpose | Data | Deployment |
|---|---|---|---|
| Local | development and fast tests | local/disposable or developer Neon branch | local processes |
| Preview | PR visual/integration review | isolated/sanitised branch where needed | Vercel previews |
| Staging | production-like integration/UAT | dedicated Neon branch/database, test providers | stable Vercel staging aliases |
| Production | real hotels/customers | production Neon/provider accounts | protected Vercel production projects |

Preview deployments must not default to the production database or production payment credentials.

## 3. Environment variable registry

OPS-01 must maintain a complete table. Initial categories:

### Database

- `DATABASE_URL` — pooled application connection.
- `DATABASE_DIRECT_URL` — direct migration/admin connection.

### Auth

- `AUTH_SECRET`
- app-specific public/canonical URLs
- Google OAuth client ID/secret and callback URLs
- JWT issuer/audience configuration when SEC-01 is complete

### Stripe

- secret key
- publishable key
- webhook secret
- supported/default currency policy

### Firebase/notifications

- project ID
- client email
- private key
- any public mobile platform configuration
- VAPID fields where web push remains active

### Scheduling/internal services

- customer/partner/admin base URLs
- `CRON_SECRET`
- realtime push URL and auth secret

### Storage/observability

- Vercel Blob token or future R2/S3 fields
- Sentry DSN/project/org/auth token

Each variable must declare owner, secrecy, required environments and validation. Required server secrets fail closed.

## 4. Vercel project structure

Maintain separate Vercel projects for web, partner and admin, each with:

- correct monorepo root/build filter;
- explicit environment variables per environment;
- production domain/alias;
- deployment protection as appropriate;
- health/smoke verification;
- clear ownership.

Do not assume a green Vercel build proves runtime database, auth, webhook or scheduled operations work.

## 5. Health and readiness

Each application should expose or internally implement:

### Liveness

Proves the process can respond. Must not depend on every external provider.

### Readiness

Checks critical configuration and a bounded database query. It should identify component/version/environment without exposing secrets.

### Smoke tests

After staging/production deployment, verify:

- homepage/sign-in reachability;
- database query;
- protected route behaviour;
- representative API call;
- partner/admin access;
- realtime health;
- scheduled endpoint auth;
- provider test-mode connectivity where safe.

## 6. Deployment gates

Recommended flow:

```text
PR -> lint/type/test/build -> preview -> review
main -> full tests -> migration rehearsal -> staging deploy/smoke
release approval -> production migration -> app deploy -> smoke -> monitor
```

Database and application deployment order follows expand/migrate/contract compatibility rules.

Use GitHub Environments for staging/production secrets and approval protection where CI initiates deployments. Prefer OIDC over long-lived cloud credentials when supported.

References:

- https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments
- https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments

## 7. Scheduled jobs

Current GitHub scheduled workflows are an acceptable development baseline but require hardening.

Rules:

- mutation uses POST;
- secret is mandatory and endpoint fails closed;
- no unauthenticated fallback header;
- curl uses fail/status handling, timeout and bounded retries;
- job is idempotent and records execution/result;
- overlapping runs are prevented with concurrency controls where needed;
- alerts exist for repeated failure.

Booking expiry/payment/reconciliation should ultimately use a reliable job/outbox system appropriate to operational requirements.

## 8. Neon operations

- Application traffic uses pooled connection strings.
- Migrations, `pg_dump` and session-dependent administration use direct connections.
- Staging and preview use isolated branches/databases.
- Migration jobs are one-time protected operations, not run independently by every app instance.
- Monitor query latency, connection pressure, cache hit ratio and slow queries.

Reference: https://neon.com/docs/connect/connection-pooling

## 9. Backup and recovery

OPS-03 must document and rehearse:

- database backup/restore or Neon recovery capability;
- object storage recovery/versioning;
- secret rotation;
- payment/provider reconciliation after outage;
- rebuilding realtime state from durable database state;
- release rollback and forward-fix.

Define RPO/RTO before commercial launch.

## 10. Observability

Required signals:

- request/error rate and latency per app/route;
- database query latency/errors;
- booking creation/conflict/expiry/cancellation;
- payment attempt/success/failure/webhook lag;
- inventory allocation conflicts;
- cron/job success and duration;
- realtime connections/delivery failures;
- mobile crash and API error rates.

Logs use correlation/request IDs and redact PII/secrets.

## 11. Portability plan

Vercel remains current production baseline. Prepare without migrating prematurely:

1. enable/test Next.js standalone output;
2. keep standard Node build/start compatibility;
3. introduce provider-neutral media storage interface;
4. separate pooled/direct database URLs;
5. validate all required environment variables;
6. create Dockerfiles and Compose for staging;
7. run a non-production VPS/container smoke deployment;
8. document multi-instance cache and Server Action encryption requirements.

When traffic/cost justifies migration, move the same Next.js applications to VPS or managed containers behind a reverse proxy/CDN.

Next.js self-hosting reference: https://nextjs.org/docs/app/guides/self-hosting

## 12. Release rollback

Every release record states:

- previous deployment/version;
- migration compatibility;
- whether app rollback is safe after migration;
- forward-fix steps for irreversible schema/data changes;
- person/agent responsible;
- smoke/monitoring window and abort criteria.

Do not deploy an irreversible financial or booking migration without a tested recovery plan.