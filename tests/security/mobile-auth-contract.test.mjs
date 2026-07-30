import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

async function read(relativePath) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

test("credential routes use the centralized session service without fallback secrets", async () => {
  for (const route of [
    "apps/web/app/api/auth/mobile-login/route.ts",
    "apps/web/app/api/auth/mobile-register/route.ts",
  ]) {
    const source = await read(route);
    assert.match(source, /createMobileSession/);
    assert.match(source, /enforceMobileAuthRateLimit/);
    assert.doesNotMatch(source, /your-secret-key/);
    assert.doesNotMatch(source, /jwt\.sign/);
  }
});

test("Google route rejects client assertions and does not persist provider tokens", async () => {
  const source = await read("apps/web/app/api/mobile/google-auth/route.ts");

  assert.match(source, /verifyGoogleIdToken/);
  assert.match(source, /providerAccountId: googleIdentity\.providerAccountId/);
  assert.doesNotMatch(source, /userInfo/);
  assert.doesNotMatch(source, /access_token\s*:/);
  assert.doesNotMatch(source, /id_token\s*:/);
  assert.doesNotMatch(source, /Continuing with token despite audience mismatch/);
});

test("mobile sessions are revocable and checked against active database state", async () => {
  const service = await read("apps/web/lib/mobile-auth.ts");
  const logout = await read("apps/web/app/api/auth/mobile-logout/route.ts");

  assert.match(service, /tx\.insert\(sessions\)/);
  assert.match(service, /gt\(sessions\.expires, new Date\(\)\)/);
  assert.match(service, /delete\(sessions\)/);
  assert.match(service, /isNull\(users\.deletedAt\)/);
  assert.match(logout, /revokeMobileSession/);
  assert.match(logout, /export async function POST/);
});

test("rate limits hash request identity and serialize counters in PostgreSQL", async () => {
  const source = await read("apps/web/lib/mobile-auth-rate-limit.ts");

  assert.match(source, /createHmac\("sha256"/);
  assert.match(source, /verificationTokens/);
  assert.match(source, /pg_advisory_xact_lock/);
  assert.doesNotMatch(source, /console\.(log|info|warn).*clientAddress/);
});

test("Flutter Google configuration and logout are server controlled", async () => {
  const source = await read(
    "apps/mobile-flutter/lib/features/auth/providers/auth_provider.dart",
  );

  assert.match(source, /String\.fromEnvironment\('GOOGLE_SERVER_CLIENT_ID'\)/);
  assert.match(source, /initialize\(serverClientId: _serverClientId\)/);
  assert.match(source, /post\('\/auth\/mobile-logout'\)/);
  assert.doesNotMatch(source, /\d+-[a-z0-9]+\.apps\.googleusercontent\.com/);
});

test("mobile auth environment and required security workflow are documented", async () => {
  const env = await read(".env.example");
  const turbo = await read("turbo.json");
  const workflow = await read(".github/workflows/mobile-auth-security.yml");

  for (const name of [
    "MOBILE_JWT_ISSUER",
    "MOBILE_JWT_AUDIENCE",
    "MOBILE_JWT_TTL_SECONDS",
    "MOBILE_GOOGLE_CLIENT_IDS",
  ]) {
    assert.match(env, new RegExp(name));
    assert.match(turbo, new RegExp(name));
  }

  assert.match(workflow, /node --test tests\/security\/\*\.test\.mjs/);
  assert.match(workflow, /npm --workspace web run check-types/);
  assert.doesNotMatch(workflow, /continue-on-error:\s*true/i);
  assert.doesNotMatch(workflow, /\|\|\s*(true|echo)\b/i);
});
