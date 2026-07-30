import process from "node:process";

const confirmation = process.env.ALLOW_DB_PUSH;
const environment = (process.env.APP_ENV ?? process.env.NODE_ENV ?? "").toLowerCase();
const rawUrl = process.env.DATABASE_DIRECT_URL ?? process.env.DATABASE_URL;

if (confirmation !== "I_UNDERSTAND_LOCAL_ONLY") {
  throw new Error(
    "db:push:local requires ALLOW_DB_PUSH=I_UNDERSTAND_LOCAL_ONLY. " +
      "Shared preview, staging and production databases must use generated migrations.",
  );
}

if (!new Set(["local", "development", "test"]).has(environment)) {
  throw new Error(
    `db:push:local is disabled for APP_ENV/NODE_ENV=${environment || "unset"}.`,
  );
}

if (!rawUrl) {
  throw new Error("DATABASE_DIRECT_URL (or local DATABASE_URL) is required.");
}

const url = new URL(rawUrl);
const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);

if (!localHosts.has(url.hostname)) {
  throw new Error(
    `db:push:local only accepts a localhost PostgreSQL server; received ${url.hostname}.`,
  );
}

console.log(`Local schema push authorised for ${url.hostname}/${url.pathname.slice(1)}.`);
