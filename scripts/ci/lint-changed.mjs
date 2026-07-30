import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import process from "node:process";

const repositoryRoot = process.cwd();
const lintableExtension = /\.(?:c|m)?(?:j|t)sx?$/i;
const ignoredRootSourcePrefixes = ["scripts/ci/", "tests/ci/"];

const workspacePrefixes = [
  "apps/web/",
  "apps/partner/",
  "apps/admin/",
  "packages/api/",
  "packages/config/",
  "packages/db/",
  "packages/ui/",
];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
    ...options,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const details = options.capture
      ? `${result.stdout ?? ""}${result.stderr ?? ""}`.trim()
      : "";
    throw new Error(
      `${command} ${args.join(" ")} failed with exit code ${result.status}${details ? `\n${details}` : ""}`,
    );
  }

  return result.stdout ?? "";
}

function gitOutput(args) {
  return run("git", args, { capture: true });
}

function resolveDiffRange() {
  const baseRef = process.env.GITHUB_BASE_REF?.trim();
  if (baseRef) {
    const remoteBase = `origin/${baseRef}`;
    try {
      gitOutput(["rev-parse", "--verify", remoteBase]);
    } catch {
      gitOutput(["fetch", "--no-tags", "origin", baseRef]);
    }
    return `${remoteBase}...HEAD`;
  }

  const eventBefore = process.env.GITHUB_EVENT_BEFORE?.trim();
  if (eventBefore && !/^0+$/.test(eventBefore)) {
    try {
      gitOutput(["rev-parse", "--verify", eventBefore]);
      return `${eventBefore}...HEAD`;
    } catch {
      // Fall through to the local/default branch strategy.
    }
  }

  try {
    gitOutput(["rev-parse", "--verify", "origin/main"]);
    return "origin/main...HEAD";
  } catch {
    try {
      gitOutput(["rev-parse", "--verify", "HEAD^"]);
      return "HEAD^...HEAD";
    } catch {
      return null;
    }
  }
}

function changedFiles() {
  const range = resolveDiffRange();
  const args = range
    ? ["diff", "--name-only", "--diff-filter=ACMR", "-z", range, "--"]
    : ["ls-files", "-z"];
  const output = gitOutput(args);

  return output
    .split("\0")
    .filter(Boolean)
    .filter((file) => lintableExtension.test(file))
    .filter((file) => existsSync(path.join(repositoryRoot, file)));
}

function workspaceFor(file) {
  return workspacePrefixes.find((prefix) => file.startsWith(prefix)) ?? null;
}

const files = changedFiles();
if (files.length === 0) {
  console.log("No changed JavaScript/TypeScript source files require linting.");
  process.exit(0);
}

const groups = new Map();
const unmapped = [];

for (const file of files) {
  if (ignoredRootSourcePrefixes.some((prefix) => file.startsWith(prefix))) {
    continue;
  }

  const workspace = workspaceFor(file);
  if (!workspace) {
    unmapped.push(file);
    continue;
  }

  const relativeFile = file.slice(workspace.length);
  const group = groups.get(workspace) ?? [];
  group.push(relativeFile);
  groups.set(workspace, group);
}

if (unmapped.length > 0) {
  throw new Error(
    `Changed lintable files are not mapped to an ESLint workspace:\n${unmapped
      .map((file) => `- ${file}`)
      .join("\n")}\nAdd an explicit workspace mapping/configuration before merging.`,
  );
}

for (const [workspace, workspaceFiles] of groups) {
  const workspaceRoot = path.join(repositoryRoot, workspace);
  const packageJsonPath = path.join(workspaceRoot, "package.json");
  const eslintConfigCandidates = [
    "eslint.config.js",
    "eslint.config.mjs",
    "eslint.config.cjs",
  ];

  if (!existsSync(packageJsonPath)) {
    throw new Error(`Missing package.json for lint workspace ${workspace}`);
  }

  if (!eslintConfigCandidates.some((name) => existsSync(path.join(workspaceRoot, name)))) {
    throw new Error(`Missing ESLint flat config for lint workspace ${workspace}`);
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  if (!packageJson.scripts?.lint) {
    throw new Error(`Missing lint script for workspace ${workspace}`);
  }

  console.log(`Linting ${workspaceFiles.length} changed file(s) in ${workspace}`);
  const result = spawnSync(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["eslint", "--max-warnings", "0", ...workspaceFiles],
    {
      cwd: workspaceRoot,
      stdio: "inherit",
      env: process.env,
    },
  );

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("Changed-file lint ratchet passed with zero warnings.");
