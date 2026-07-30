import assert from "node:assert/strict";
import test from "node:test";
import jwt from "jsonwebtoken";
import {
  MAX_MOBILE_JWT_TTL_SECONDS,
  MIN_MOBILE_JWT_TTL_SECONDS,
  getMobileAuthConfig,
  signMobileAccessToken,
  verifyMobileAccessToken,
} from "../../apps/web/lib/mobile-auth-token.ts";

const secret = "0123456789abcdef0123456789abcdef0123456789abcdef";
const env = {
  AUTH_SECRET: secret,
  MOBILE_JWT_ISSUER: "zinurooms-test",
  MOBILE_JWT_AUDIENCE: "zinurooms-mobile-test",
  MOBILE_JWT_TTL_SECONDS: "3600",
};

const config = getMobileAuthConfig(env);
const subject = {
  userId: "user-1",
  email: "traveler@example.com",
  name: "Traveler",
  role: "TRAVELER",
};

test("mobile auth configuration fails closed", () => {
  assert.throws(
    () => getMobileAuthConfig({ ...env, AUTH_SECRET: undefined }),
    /AUTH_SECRET environment variable is required/,
  );
  assert.throws(
    () => getMobileAuthConfig({ ...env, AUTH_SECRET: "too-short" }),
    /at least 32 bytes/,
  );
  assert.throws(
    () => getMobileAuthConfig({ ...env, MOBILE_JWT_ISSUER: undefined }),
    /MOBILE_JWT_ISSUER environment variable is required/,
  );
  assert.throws(
    () => getMobileAuthConfig({ ...env, MOBILE_JWT_AUDIENCE: undefined }),
    /MOBILE_JWT_AUDIENCE environment variable is required/,
  );
});

test("mobile auth TTL is bounded", () => {
  assert.throws(
    () =>
      getMobileAuthConfig({
        ...env,
        MOBILE_JWT_TTL_SECONDS: String(MIN_MOBILE_JWT_TTL_SECONDS - 1),
      }),
    /must be between/,
  );
  assert.throws(
    () =>
      getMobileAuthConfig({
        ...env,
        MOBILE_JWT_TTL_SECONDS: String(MAX_MOBILE_JWT_TTL_SECONDS + 1),
      }),
    /must be between/,
  );
});

test("issued mobile token contains the required identity and session claims", () => {
  const token = signMobileAccessToken(subject, "session-1", config);
  const verified = verifyMobileAccessToken(token, config);

  assert.equal(verified.userId, subject.userId);
  assert.equal(verified.sessionId, "session-1");
  assert.equal(verified.email, subject.email);
  assert.equal(verified.role, subject.role);
  assert.ok(verified.expiresAt > verified.issuedAt);
});

test("verification rejects a different algorithm", () => {
  const token = jwt.sign(
    {
      token_use: "mobile-access",
      email: subject.email,
      name: subject.name,
      role: subject.role,
    },
    secret,
    {
      algorithm: "HS384",
      issuer: config.issuer,
      audience: config.audience,
      subject: subject.userId,
      jwtid: "session-2",
      expiresIn: 3600,
    },
  );

  assert.throws(() => verifyMobileAccessToken(token, config), /invalid algorithm/i);
});

test("verification rejects wrong issuer, audience and expired tokens", () => {
  const token = signMobileAccessToken(subject, "session-3", config);

  assert.throws(() =>
    verifyMobileAccessToken(token, { ...config, issuer: "other-issuer" }),
  );
  assert.throws(() =>
    verifyMobileAccessToken(token, { ...config, audience: "other-audience" }),
  );

  const expired = jwt.sign(
    {
      token_use: "mobile-access",
      email: subject.email,
      name: subject.name,
      role: subject.role,
    },
    secret,
    {
      algorithm: "HS256",
      issuer: config.issuer,
      audience: config.audience,
      subject: subject.userId,
      jwtid: "session-expired",
      expiresIn: -60,
    },
  );
  assert.throws(() => verifyMobileAccessToken(expired, config), /expired/i);
});

test("verification rejects tokens without the mobile access purpose", () => {
  const token = jwt.sign(
    { email: subject.email, name: subject.name, role: subject.role },
    secret,
    {
      algorithm: "HS256",
      issuer: config.issuer,
      audience: config.audience,
      subject: subject.userId,
      jwtid: "session-4",
      expiresIn: 3600,
    },
  );

  assert.throws(() => verifyMobileAccessToken(token, config), /claims are invalid/);
});
