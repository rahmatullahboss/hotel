import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import path from "node:path";

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

const requiredWorkspaceScripts = ["build", "lint", "check-types"];
const coreWorkspaces = [
  "apps/web/package.json",
  "apps/partner/package.json",
  "apps/admin/package.json",
  "packages/api/package.json",
  "packages/db/package.json",
];

test("root exposes one strict CI entry point", async () => {
  const rootPackage = await readJson("package.json");

  assert.equal(rootPackage.scripts.test, "npm run test:ci");
  assert.equal(rootPackage.scripts["lint:ci"], "node scripts/ci/lint-changed.mjs");
  assert.equal(rootPackage.scripts["test:ci"], "node --test tests/ci/*.test.mjs");
  assert.equal(
    rootPackage.scripts["verify:ci"],
    "npm run lint:ci && npm run check-types && npm run test:ci && npm run build",
  );
  assert.match(rootPackage.engines.node, /22/);
  assert.equal(rootPackage.packageManager, "npm@11.6.2");
});

test("core workspaces expose build, lint and type-check commands", async () => {
  for (const packagePath of coreWorkspaces) {
    const packageJson = await readJson(packagePath);

    for (const script of requiredWorkspaceScripts) {
      assert.ok(
        packageJson.scripts?.[script],
        `${packagePath} must define the ${script} script`,
      );
    }
  }
});

test("changed-file lint ratchet is explicit and zero-warning", async () => {
  const lintScript = await readText("scripts/ci/lint-changed.mjs");

  assert.match(lintScript, /--max-warnings["',\s]+0/);
  assert.match(lintScript, /GITHUB_BASE_REF/);
  assert.match(lintScript, /origin\/main\.\.\.HEAD/);
  assert.match(lintScript, /Missing ESLint flat config/);
  assert.match(lintScript, /not mapped to an ESLint workspace/);
});

test("monorepo workflow runs every required gate without false-green patterns", async () => {
  const workflow = await readText(".github/workflows/monorepo-ci.yml");
  const requiredCommands = [
    "npm ci",
    "npm run lint:ci",
    "npm run check-types",
    "npm run test:ci",
    "npm run build",
  ];

  for (const command of requiredCommands) {
    assert.ok(workflow.includes(command), `workflow must run: ${command}`);
  }

  assert.match(workflow, /actions\/checkout@v5/);
  assert.match(workflow, /actions\/setup-node@v6/);
  assert.match(workflow, /fetch-depth:\s*0/);
  assert.doesNotMatch(workflow, /continue-on-error\s*:\s*true/i);
  assert.doesNotMatch(workflow, /\|\|\s*(true|echo)\b/i);
  assert.doesNotMatch(workflow, /--if-present\b/i);
  assert.match(workflow, /permissions:\s*\n\s+contents:\s+read/);
  assert.match(workflow, /CI_DATABASE_URL/);
});
