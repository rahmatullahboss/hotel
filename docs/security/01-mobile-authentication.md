# Mobile Authentication Security

## Scope

This document defines the customer Flutter authentication contract implemented by `SEC-01`.

Covered endpoints:

- `POST /api/auth/mobile-login`
- `POST /api/auth/mobile-register`
- `POST /api/mobile/google-auth`
- `POST /api/auth/mobile-logout`

Protected mobile APIs use the bearer token through `apps/web/lib/mobile-auth.ts`.

## Required configuration

The web application must have all of the following before mobile authentication can issue or verify tokens:

- `AUTH_SECRET`: at least 32 random bytes;
- `MOBILE_JWT_ISSUER`: stable issuer name for the environment;
- `MOBILE_JWT_AUDIENCE`: stable Flutter API audience;
- `MOBILE_JWT_TTL_SECONDS`: optional, defaults to 86,400 seconds and is bounded between 900 and 604,800 seconds;
- `AUTH_GOOGLE_ID` and/or `MOBILE_GOOGLE_CLIENT_IDS`: allowed Google OAuth client IDs.

The Flutter application receives the backend/server Google OAuth client ID at build time:

```bash
flutter build apk --dart-define=GOOGLE_SERVER_CLIENT_ID=<server-oauth-client-id>
```

Do not place `AUTH_SECRET`, database credentials, Google client secrets or any server credential in Flutter build definitions.

## Token contract

Mobile access tokens:

- use only `HS256`;
- include an explicit issuer and audience;
- include `sub` as the user ID;
- include `jti` as the database session ID;
- include `iat` and mandatory `exp`;
- include `token_use=mobile-access`;
- are rejected when their serialized length exceeds the configured hard limit;
- are accepted only while the matching `sessions` row remains present and unexpired;
- are rejected for soft-deleted users.

The token is stored only in Flutter secure storage. Release code must not log it.

## Revocation and logout

Each successful credential or Google authentication creates a row in the existing `sessions` table. The JWT `jti` identifies that row.

`POST /api/auth/mobile-logout` deletes only the current mobile session. After deletion, the same JWT fails protected API authentication even when its cryptographic expiry has not yet passed.

Flutter calls the server logout endpoint before deleting its local secure-storage token. Local logout still completes when the server session is already expired or unavailable.

A future “log out all devices” feature should delete every active `sessions` row for the user in a separately reviewed endpoint.

## Google identity verification

The backend accepts only an ID token. It does not trust client-supplied profile/user information and does not accept an access-token-only fallback.

Verification requires:

- successful response from Google's token verification service;
- `aud` in the configured client-ID allowlist;
- `azp`, when present, in the same allowlist;
- Google issuer;
- non-expired token;
- verified email;
- stable Google subject (`sub`).

Google access and ID tokens are not persisted by this mobile route. The accounts table stores only the provider and provider account ID required to link the identity.

## Rate limiting

Credential login, registration and Google login have bounded IP and account-oriented limits.

Rate-limit attempt rows reuse `verificationTokens` and are serialized with a PostgreSQL advisory transaction lock. Identifiers are HMAC-SHA256 values derived from the request scope, client address and normalized account subject. Raw IP addresses and emails are not stored in the rate-limit key.

Expired attempt rows are removed as requests are processed. This implementation is intentionally database-backed so independent Next.js instances share the same limit state.

## Public errors and events

Authentication endpoints return stable public error codes and `Cache-Control: no-store`. Rate-limited responses include `Retry-After`.

Security events contain an event name, optional user ID, HMAC subject hash and bounded reason. They must not contain passwords, bearer tokens, Google tokens, raw emails or raw IP addresses.

## Deployment order

1. Configure strong, environment-specific values for all required server variables.
2. Configure the correct Google OAuth client-ID allowlist.
3. Build Flutter with `GOOGLE_SERVER_CLIENT_ID` set to the backend/server OAuth client ID.
4. Deploy the web API.
5. Execute the required mobile-auth security workflow.
6. Test credential registration, credential login, Google login, protected profile access, logout and post-logout token rejection.
7. Release the Flutter build only after the server deployment and smoke tests are successful.

## Secret rotation

Changing `AUTH_SECRET` immediately invalidates every existing mobile JWT and may also affect Auth.js sessions depending on the deployment configuration. Rotation therefore requires:

1. an announced maintenance/re-authentication window;
2. deployment of the new secret to every web instance at the same time;
3. deletion of existing mobile session rows when a forced global logout is intended;
4. verification that old tokens fail and newly issued tokens pass;
5. monitoring of authentication failure rates after rollout.

Any environment that may have run with the former public fallback secret must rotate `AUTH_SECRET` before production use.

## Verification

Required checks:

- missing or weak secret fails closed;
- invalid algorithm, issuer, audience, purpose and expiry are rejected;
- Google audience, authorized party, issuer, expiry and email verification are enforced;
- source regression tests prohibit fallback secrets and trusted client `userInfo`;
- web auth files lint with zero warnings;
- customer web type-check succeeds;
- Flutter strict CI succeeds for the changed provider.
