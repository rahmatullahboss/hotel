import assert from "node:assert/strict";
import test from "node:test";
import {
  GoogleTokenVerificationError,
  getAllowedGoogleClientIds,
  verifyGoogleIdToken,
} from "../../apps/web/lib/mobile-google-auth.ts";

const env = {
  AUTH_GOOGLE_ID: "web-client.apps.googleusercontent.com",
  MOBILE_GOOGLE_CLIENT_IDS:
    "android-client.apps.googleusercontent.com, ios-client.apps.googleusercontent.com",
};

function response(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function validPayload(overrides = {}) {
  return {
    aud: "android-client.apps.googleusercontent.com",
    azp: "android-client.apps.googleusercontent.com",
    iss: "https://accounts.google.com",
    sub: "google-user-1",
    email: "Traveler@Example.com",
    email_verified: "true",
    name: "Traveler",
    picture: "https://example.com/avatar.png",
    exp: "2000000000",
    ...overrides,
  };
}

test("Google client IDs must be configured and are deduplicated", () => {
  assert.throws(
    () => getAllowedGoogleClientIds({}),
    (error) =>
      error instanceof GoogleTokenVerificationError &&
      error.kind === "configuration",
  );

  assert.deepEqual(getAllowedGoogleClientIds(env), [
    "web-client.apps.googleusercontent.com",
    "android-client.apps.googleusercontent.com",
    "ios-client.apps.googleusercontent.com",
  ]);
});

test("valid Google tokeninfo response is normalized", async () => {
  const identity = await verifyGoogleIdToken("valid-token", {
    env,
    nowSeconds: 1_900_000_000,
    fetcher: async () => response(validPayload()),
  });

  assert.deepEqual(identity, {
    providerAccountId: "google-user-1",
    email: "traveler@example.com",
    name: "Traveler",
    picture: "https://example.com/avatar.png",
  });
});

test("Google audience and authorized party mismatches are rejected", async () => {
  await assert.rejects(
    verifyGoogleIdToken("bad-audience", {
      env,
      nowSeconds: 1_900_000_000,
      fetcher: async () => response(validPayload({ aud: "attacker-client" })),
    }),
    (error) =>
      error instanceof GoogleTokenVerificationError && error.kind === "invalid",
  );

  await assert.rejects(
    verifyGoogleIdToken("bad-azp", {
      env,
      nowSeconds: 1_900_000_000,
      fetcher: async () => response(validPayload({ azp: "attacker-client" })),
    }),
    (error) =>
      error instanceof GoogleTokenVerificationError && error.kind === "invalid",
  );
});

test("unverified email, wrong issuer and expired Google tokens are rejected", async () => {
  for (const overrides of [
    { email_verified: "false" },
    { iss: "https://attacker.example" },
    { exp: "1800000000" },
  ]) {
    await assert.rejects(
      verifyGoogleIdToken("invalid-claims", {
        env,
        nowSeconds: 1_900_000_000,
        fetcher: async () => response(validPayload(overrides)),
      }),
      (error) =>
        error instanceof GoogleTokenVerificationError && error.kind === "invalid",
    );
  }
});

test("Google service failures are distinguished from invalid tokens", async () => {
  await assert.rejects(
    verifyGoogleIdToken("provider-failure", {
      env,
      fetcher: async () => response({ error: "provider error" }, 503),
    }),
    (error) =>
      error instanceof GoogleTokenVerificationError &&
      error.kind === "unavailable",
  );

  await assert.rejects(
    verifyGoogleIdToken("invalid-token", {
      env,
      fetcher: async () => response({ error: "invalid token" }, 400),
    }),
    (error) =>
      error instanceof GoogleTokenVerificationError && error.kind === "invalid",
  );
});
