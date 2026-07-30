import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

async function readText(relativePath) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

async function readJson(relativePath) {
  return JSON.parse(await readText(relativePath));
}

async function fileExists(relativePath) {
  try {
    await access(path.join(repositoryRoot, relativePath));
    return true;
  } catch {
    return false;
  }
}

test("root and database packages expose migration-first commands", async () => {
  const rootPackage = await readJson("package.json");
  const databasePackage = await readJson("packages/db/package.json");

  for (const packageJson of [rootPackage, databasePackage]) {
    assert.ok(packageJson.scripts["db:generate"]);
    assert.ok(packageJson.scripts["db:migrate"]);
    assert.ok(packageJson.scripts["db:check"]);
    assert.ok(packageJson.scripts["db:adoption-manifest"]);
    assert.ok(packageJson.scripts["db:push:local"]);
    assert.equal(packageJson.scripts["db:push"], undefined);
  }
});

test("Drizzle tooling requires a direct non-pooled migration URL", async () => {
  const config = await readText("packages/db/drizzle.config.ts");

  assert.match(config, /process\.env\.DATABASE_DIRECT_URL/);
  assert.doesNotMatch(config, /process\.env\.DATABASE_URL/);
  assert.match(config, /strict:\s*true/);
  assert.match(config, /verbose:\s*true/);
});

test("local schema push is guarded by environment, confirmation and host", async () => {
  const guard = await readText("packages/db/scripts/guard-local-push.mjs");

  assert.match(guard, /ALLOW_DB_PUSH/);
  assert.match(guard, /I_UNDERSTAND_LOCAL_ONLY/);
  assert.match(guard, /APP_ENV/);
  assert.match(guard, /localhost/);
  assert.match(guard, /127\.0\.0\.1/);
  assert.match(guard, /::1/);
});

test("migration journal is contiguous and every entry has SQL and snapshot", async () => {
  const journal = await readJson("packages/db/drizzle/meta/_journal.json");

  assert.equal(journal.dialect, "postgresql");
  assert.ok(journal.entries.length > 0, "at least one migration is required");

  const tags = new Set();
  let previousWhen = 0;

  for (const [position, entry] of journal.entries.entries()) {
    assert.equal(entry.idx, position, `migration index ${position} must be contiguous`);
    assert.ok(!tags.has(entry.tag), `duplicate migration tag: ${entry.tag}`);
    assert.ok(entry.when > previousWhen, `migration ${entry.tag} timestamp must increase`);
    assert.equal(
      await fileExists(`packages/db/drizzle/${entry.tag}.sql`),
      true,
      `missing SQL for ${entry.tag}`,
    );
    assert.equal(
      await fileExists(`packages/db/drizzle/meta/${entry.tag}_snapshot.json`),
      true,
      `missing snapshot for ${entry.tag}`,
    );

    tags.add(entry.tag);
    previousWhen = entry.when;
  }
});

test("adoption manifest is derived from complete committed SQL files", async () => {
  const journal = await readJson("packages/db/drizzle/meta/_journal.json");
  const manifestScript = await readText(
    "packages/db/scripts/create-adoption-manifest.mjs",
  );

  assert.match(manifestScript, /createHash\("sha256"\)/);
  assert.match(manifestScript, /--json/);
  assert.match(manifestScript, /does not connect to a database/);

  for (const entry of journal.entries) {
    const sql = await readText(`packages/db/drizzle/${entry.tag}.sql`);
    const hash = createHash("sha256").update(sql).digest("hex");
    assert.equal(hash.length, 64, `${entry.tag} must produce a SHA-256 hash`);
  }
});

test("database migration workflow proves clean install, hashes and repeatability", async () => {
  const workflow = await readText(".github/workflows/database-migrations.yml");

  assert.match(workflow, /postgres:17-alpine/);
  assert.match(workflow, /npm run db:check/);
  assert.match(workflow, /npm run db:migrate/);
  assert.match(workflow, /npm run db:adoption-manifest -- --json/);
  assert.match(workflow, /diff -u \/tmp\/expected-migrations\.tsv/);
  assert.match(workflow, /Verify second migration run is a no-op/);
  assert.match(workflow, /drizzle\.__drizzle_migrations/);
  assert.doesNotMatch(workflow, /continue-on-error:\s*true/i);
  assert.doesNotMatch(workflow, /\|\|\s*(true|echo)\b/i);
});

test("temporary database generator workflow is absent", async () => {
  assert.equal(
    await fileExists(".github/workflows/db-baseline-generate.yml"),
    false,
  );
});
